<?php

namespace App\Console\Commands;

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\LegalCategory;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVersion;
use App\Models\User;
use App\Support\UniqueSlugGenerator;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

class MigratePart4
{
    private const CHUNK_SIZE = 500;

    public function __construct(
        private Command $console
    ) {}

    public function migrateProducts(bool $dryRun): void
    {
        $this->console->info('Migrating Products...');

        $query = MigrateHelper::legacy('ad_dad_product_doc');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $categories = LegalCategory::query()->pluck('id', 'slug');
        $migrated = 0;
        $existing = 0;
        $missingUsers = 0;
        $missingCategories = 0;
        $invalidRows = 0;
        $fallbackSlugs = 0;
        $legacySales = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            $categories,
            &$migrated,
            &$existing,
            &$missingUsers,
            &$missingCategories,
            &$invalidRows,
            &$fallbackSlugs,
            &$legacySales
        ): void {
            $existingIds = Product::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $users = User::query()
                ->whereIn('id', $rows->pluck('user_id')->filter())
                ->pluck('id')
                ->flip();
            $posts = MigrateHelper::legacy('ad_posts')
                ->whereIn('ID', $rows->pluck('post_id')->filter())
                ->get(['ID', 'post_name', 'post_date'])
                ->keyBy('ID');

            foreach ($rows as $row) {
                $legacySales += max((int) $row->sales, 0);

                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                if (! $users->has($row->user_id)) {
                    $missingUsers++;
                    $bar->advance();

                    continue;
                }

                $type = ProductType::tryFrom((string) $row->doc_type);

                if ($type === null || (int) $row->price < 0 || (int) $row->sales < 0 || (int) $row->views < 0) {
                    $invalidRows++;
                    $bar->advance();

                    continue;
                }

                $categoryId = $categories->get(trim((string) $row->doc_category));

                if ($categoryId === null) {
                    $missingCategories++;
                }

                $post = $posts->get($row->post_id);
                $title = Str::limit(trim((string) $row->doc_title) ?: "Legacy product {$row->id}", 255, '');
                $slugSource = rawurldecode(trim((string) ($post?->post_name ?? '')));

                if ($slugSource === '') {
                    $slugSource = $title;
                    $fallbackSlugs++;
                }

                if ($dryRun) {
                    $this->console->line("Product {$row->id} => {$title}");
                } else {
                    DB::transaction(function () use ($row, $type, $categoryId, $post, $title, $slugSource): void {
                        $status = $this->productStatus($row->status);
                        $createdAt = $this->legacyDate($row->created_at) ?? now();
                        $updatedAt = $this->legacyDate($row->updated_at) ?? $createdAt;
                        $product = new Product;
                        $product->id = $row->id;
                        $product->fill([
                            'vendor_id' => $row->user_id,
                            'category_id' => $categoryId,
                            'title' => $title,
                            'slug' => $this->slugger()->generate(Product::class, $slugSource),
                            'product_type' => $type,
                            'description' => $row->doc_description,
                            'price' => $row->price,
                            'status' => $status,
                            'published_at' => $status === ProductStatus::Published
                                ? ($this->legacyDate($post?->post_date) ?? $createdAt)
                                : null,
                        ]);
                        $product->sales_count = 0;
                        $product->views_count = $row->views;
                        $product->created_at = $createdAt;
                        $product->updated_at = $updatedAt;
                        $product->save();

                        ProductVersion::query()->create([
                            'product_id' => $product->id,
                            'version' => 1,
                            'content' => $row->doc_content,
                            'created_at' => $updatedAt,
                        ]);
                    });
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Products migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Products skipped because the vendor was missing: {$missingUsers}.");
        $this->console->warn("Products with an unmapped category: {$missingCategories}.");
        $this->console->warn("Products skipped because their data was invalid: {$invalidRows}.");
        $this->console->warn("Products whose slug fell back to the title: {$fallbackSlugs}.");
        $this->console->warn("Legacy sales counter ignored ({$legacySales}); sales_count is rebuilt from migrated fulfilled orders.");
        $this->console->warn('Legacy version 1 contains the latest available document content; historical purchase-time revisions were unavailable.');
    }

    public function migrateProductOrders(bool $dryRun): void
    {
        $this->console->info('Migrating Product Orders...');

        $query = MigrateHelper::legacy('ad_dad_product_orders');
        $bar = $this->console->getOutput()->createProgressBar($query->count());
        $migrated = 0;
        $existing = 0;
        $missingReferences = 0;
        $invalidAmounts = 0;
        $invalidVendors = 0;

        $query->orderBy('id')->chunkById(self::CHUNK_SIZE, function (Collection $rows) use (
            $dryRun,
            $bar,
            &$migrated,
            &$existing,
            &$missingReferences,
            &$invalidAmounts,
            &$invalidVendors
        ): void {
            $existingIds = Order::query()
                ->whereIn('id', $rows->pluck('id'))
                ->pluck('id')
                ->flip();
            $users = User::query()
                ->whereIn(
                    'id',
                    $rows->pluck('user_id')->merge($rows->pluck('vendor_id'))->filter()->unique()
                )
                ->pluck('id')
                ->flip();
            $products = Product::query()
                ->whereIn('id', $rows->pluck('doc_id')->filter())
                ->get()
                ->keyBy('id');
            $versions = ProductVersion::query()
                ->whereIn('product_id', $products->keys())
                ->where('version', 1)
                ->get()
                ->keyBy('product_id');

            foreach ($rows as $row) {
                if ($existingIds->has($row->id)) {
                    $existing++;
                    $bar->advance();

                    continue;
                }

                $product = $products->get($row->doc_id);
                $version = $versions->get($row->doc_id);

                if (! $users->has($row->user_id)
                    || ! $users->has($row->vendor_id)
                    || $product === null
                    || $version === null) {
                    $missingReferences++;
                    $this->console->warn("Legacy product order {$row->id} skipped: missing buyer, vendor, product, or version.");
                    $bar->advance();

                    continue;
                }

                if ((int) $product->vendor_id !== (int) $row->vendor_id) {
                    $invalidVendors++;
                    $this->console->warn("Legacy product order {$row->id} skipped: vendor does not own product {$row->doc_id}.");
                    $bar->advance();

                    continue;
                }

                if (! $this->hasValidAmounts($row)) {
                    $invalidAmounts++;
                    $this->console->warn("Legacy product order {$row->id} skipped: invalid financial totals.");
                    $bar->advance();

                    continue;
                }

                if ($dryRun) {
                    $this->console->line("Product order {$row->id} => product {$row->doc_id}");
                } else {
                    DB::transaction(function () use ($row, $product, $version): void {
                        $status = $this->orderStatus($row->status);
                        $createdAt = $this->legacyDate($row->created_at) ?? now();
                        $updatedAt = $this->legacyDate($row->updated_at) ?? $createdAt;
                        $order = new Order;
                        $order->id = $row->id;
                        $order->fill([
                            'buyer_id' => $row->user_id,
                            'vendor_id' => $row->vendor_id,
                            'subtotal' => $row->total_price,
                            'discount' => $row->discount,
                            'vat' => $row->vat,
                            'total_price' => (int) $row->net_price + (int) $row->vat,
                            'commission' => $row->commission,
                            'vendor_share' => $row->vendor_share,
                            'status' => $status,
                            'paid_at' => in_array($status, [
                                OrderStatus::Paid,
                                OrderStatus::Fulfilled,
                                OrderStatus::Refunded,
                            ], true) ? $updatedAt : null,
                            'canceled_at' => $status === OrderStatus::Canceled ? $updatedAt : null,
                        ]);
                        $order->created_at = $createdAt;
                        $order->updated_at = $updatedAt;
                        $order->save();

                        $item = new OrderItem;
                        $item->id = $row->id;
                        $item->fill([
                            'order_id' => $order->id,
                            'product_id' => $product->id,
                            'product_version_id' => $version->id,
                            'vendor_id' => $row->vendor_id,
                            'product_title' => $product->title,
                            'product_type' => $product->product_type,
                            'unit_price' => $row->total_price,
                            'discount' => $row->discount,
                            'total_price' => $row->net_price,
                        ]);
                        $item->created_at = $createdAt;
                        $item->updated_at = $updatedAt;
                        $item->save();

                        $product->increment('sales_count');
                    });
                }

                $migrated++;
                $bar->advance();
            }
        });

        $bar->finish();
        $this->console->newLine();
        $this->console->info("Product orders migrated: {$migrated}; already existed: {$existing}.");
        $this->console->warn("Product orders skipped because a reference was missing: {$missingReferences}.");
        $this->console->warn("Product orders skipped because the vendor was invalid: {$invalidVendors}.");
        $this->console->warn("Product orders skipped because amounts were invalid: {$invalidAmounts}.");
    }

    private function productStatus(?string $status): ProductStatus
    {
        return match ($status) {
            'review' => ProductStatus::Pending,
            'publish' => ProductStatus::Published,
            'stop' => ProductStatus::Paused,
            default => ProductStatus::Draft,
        };
    }

    private function orderStatus(?string $status): OrderStatus
    {
        return match ($status) {
            'completed' => OrderStatus::Fulfilled,
            'canceled' => OrderStatus::Canceled,
            'refunded' => OrderStatus::Refunded,
            default => OrderStatus::Pending,
        };
    }

    private function hasValidAmounts(object $row): bool
    {
        $amounts = [
            $row->total_price,
            $row->discount,
            $row->net_price,
            $row->vat,
            $row->commission,
            $row->vendor_share,
        ];

        if (collect($amounts)->contains(fn ($amount) => (int) $amount < 0)) {
            return false;
        }

        return (int) $row->net_price === (int) $row->total_price - (int) $row->discount
            && (int) $row->net_price === (int) $row->commission + (int) $row->vendor_share;
    }

    private function legacyDate(mixed $value): ?CarbonImmutable
    {
        if (blank($value) || str_starts_with((string) $value, '0000-00-00')) {
            return null;
        }

        try {
            return CarbonImmutable::parse($value);
        } catch (Throwable) {
            return null;
        }
    }

    private function slugger(): UniqueSlugGenerator
    {
        return app(UniqueSlugGenerator::class);
    }
}
