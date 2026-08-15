<?php

namespace Tests\Feature;

use App\Models\Attachment;
use App\Models\LegalCategory;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Tests\TestCase;

class PublicProductApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('s3');
        config(['cache.stores.redis' => ['driver' => 'array']]);
        Cache::store('redis')->clear();
        $this->buildSchema();
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('products');
        Schema::dropIfExists('vendor_profiles');
        Schema::dropIfExists('user_profiles');
        Schema::dropIfExists('legal_categories');
        Schema::dropIfExists('attachments');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_public_products_only_returns_published_products_and_filter_metadata(): void
    {
        $vendor = $this->createVendor();
        $family = LegalCategory::query()->create([
            'name' => 'خانواده',
            'slug' => 'family',
        ]);

        $this->createProduct($vendor, $family, [
            'title' => 'قرارداد فروش',
            'slug' => 'sale-contract',
            'product_type' => 'contract',
            'price' => 250000,
            'sales_count' => 12,
        ]);
        $this->createProduct($vendor, $family, [
            'title' => 'دادخواست مطالبه وجه',
            'slug' => 'payment-petition',
            'product_type' => 'petition',
            'price' => 120000,
            'sales_count' => 3,
        ]);
        $this->createProduct($vendor, $family, [
            'title' => 'محصول پیش‌نویس',
            'slug' => 'draft-product',
            'status' => 'draft',
            'published_at' => null,
        ]);
        $this->createProduct($vendor, $family, [
            'title' => 'محصول آینده',
            'slug' => 'future-product',
            'published_at' => now()->addDay(),
        ]);

        $this->getJson('/v1/public/products')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.slug', 'sale-contract')
            ->assertJsonPath('data.0.type', 'contract')
            ->assertJsonPath('data.0.category.slug', 'family')
            ->assertJsonPath('data.0.vendor.slug', 'test-vendor')
            ->assertJsonPath(
                'data.0.vendor.avatarUrl',
                fn (string $url): bool => str_ends_with($url, 'avatars/vendor.jpg')
            )
            ->assertJsonPath('data.0.price', 250000)
            ->assertJsonMissingPath('data.0.id')
            ->assertJsonMissingPath('data.0.content')
            ->assertJsonPath('meta.total', 2)
            ->assertJsonPath('filters.total', 2)
            ->assertJsonPath('filters.categories.0.slug', 'family')
            ->assertJsonPath('filters.categories.0.count', 2);
    }

    public function test_public_products_support_filters_sorting_pagination_and_validation(): void
    {
        $vendor = $this->createVendor();
        $family = LegalCategory::query()->create([
            'name' => 'خانواده',
            'slug' => 'family',
        ]);

        $this->createProduct($vendor, $family, [
            'title' => 'قرارداد گران',
            'slug' => 'expensive-contract',
            'product_type' => 'contract',
            'price' => 400000,
        ]);
        $this->createProduct($vendor, $family, [
            'title' => 'قرارداد ارزان',
            'slug' => 'cheap-contract',
            'product_type' => 'contract',
            'price' => 100000,
        ]);
        $this->createProduct($vendor, $family, [
            'title' => 'دادخواست خانواده',
            'slug' => 'family-petition',
            'product_type' => 'petition',
            'price' => 50000,
        ]);

        $this->getJson('/v1/public/products?type=contract&category=family&sort=price-asc&per_page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'cheap-contract')
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.total', 2);

        $this->getJson('/v1/public/products?search=گران')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'expensive-contract');

        $this->getJson('/v1/public/products?type=invalid&per_page=49')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['type', 'per_page']);
    }

    public function test_public_product_show_resolves_slug_and_hides_unpublished_products(): void
    {
        $vendor = $this->createVendor();
        $family = LegalCategory::query()->create([
            'name' => 'خانواده',
            'slug' => 'family',
        ]);

        $this->createProduct($vendor, $family, [
            'title' => 'قرارداد قابل نمایش',
            'slug' => 'visible-contract',
            'description' => 'توضیحات عمومی محصول',
        ]);
        $this->createProduct($vendor, $family, [
            'title' => 'قرارداد پیش‌نویس',
            'slug' => 'hidden-contract',
            'status' => 'draft',
            'published_at' => null,
        ]);

        $this->getJson('/v1/public/products/visible-contract')
            ->assertOk()
            ->assertJsonPath('data.slug', 'visible-contract')
            ->assertJsonPath('data.description', 'توضیحات عمومی محصول')
            ->assertJsonPath('data.vendor.type', 'expert')
            ->assertJsonPath(
                'data.vendor.avatarUrl',
                fn (string $url): bool => str_ends_with($url, 'avatars/vendor.jpg')
            )
            ->assertJsonMissingPath('data.id')
            ->assertJsonMissingPath('data.content');

        $this->getJson('/v1/public/products/hidden-contract')
            ->assertNotFound();
    }

    public function test_product_view_is_counted_once_per_viewer_each_day(): void
    {
        $vendor = $this->createVendor();
        $category = LegalCategory::query()->create([
            'name' => 'قراردادها',
            'slug' => 'contracts',
        ]);
        $product = $this->createProduct($vendor, $category, [
            'slug' => 'viewed-contract',
            'views_count' => 7,
        ]);
        $firstViewer = (string) Str::uuid();
        $secondViewer = (string) Str::uuid();

        $this->postJson('/v1/public/products/viewed-contract/view', [
            'viewer_key' => $firstViewer,
        ])->assertNoContent();

        $this->postJson('/v1/public/products/viewed-contract/view', [
            'viewer_key' => $firstViewer,
        ])->assertNoContent();

        $this->postJson('/v1/public/products/viewed-contract/view', [
            'viewer_key' => $secondViewer,
        ])->assertNoContent();

        $this->assertSame(9, $product->fresh()->views_count);
    }

    public function test_product_view_requires_valid_viewer_and_published_product(): void
    {
        $vendor = $this->createVendor();
        $category = LegalCategory::query()->create([
            'name' => 'قراردادها',
            'slug' => 'contracts',
        ]);
        $this->createProduct($vendor, $category, [
            'slug' => 'view-validation-contract',
        ]);
        $this->createProduct($vendor, $category, [
            'slug' => 'hidden-view-contract',
            'status' => 'draft',
            'published_at' => null,
        ]);

        $this->postJson('/v1/public/products/view-validation-contract/view', [
            'viewer_key' => 'invalid',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('viewer_key');

        $this->postJson('/v1/public/products/hidden-view-contract/view', [
            'viewer_key' => (string) Str::uuid(),
        ])->assertNotFound();
    }

    private function createVendor(): User
    {
        $vendor = User::query()->create([
            'mobile' => '09120000000',
            'first_name' => 'فروشنده',
            'last_name' => 'آزمایشی',
            'role' => 'legal_expert',
            'is_vendor' => true,
        ]);

        $vendor->vendorProfile()->create([
            'slug' => 'test-vendor',
            'vendor_type' => 'expert',
            'is_active' => true,
        ]);

        $avatar = Attachment::query()->create([
            'user_id' => $vendor->getKey(),
            'storage_key' => 'avatars/vendor.jpg',
            'original_name' => 'vendor.jpg',
            'mime_type' => 'image/jpeg',
            'is_private' => false,
        ]);

        $vendor->profile()->create([
            'avatar_id' => $avatar->getKey(),
        ]);

        return $vendor;
    }

    /**
     * @param  array<string, mixed>  $overrides
     */
    private function createProduct(
        User $vendor,
        LegalCategory $category,
        array $overrides = []
    ): Product {
        return Product::query()->forceCreate(array_merge([
            'vendor_id' => $vendor->getKey(),
            'category_id' => $category->getKey(),
            'title' => 'محصول آزمایشی',
            'slug' => 'test-product',
            'product_type' => 'contract',
            'description' => null,
            'price' => 100000,
            'sales_count' => 0,
            'views_count' => 0,
            'status' => 'published',
            'published_at' => now()->subHour(),
        ], $overrides));
    }

    private function buildSchema(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('mobile')->unique();
            $table->string('first_name')->default('');
            $table->string('last_name')->default('');
            $table->string('role')->default('user');
            $table->boolean('is_vendor')->default(false);
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('legal_categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('parent_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
        });

        Schema::create('attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->nullable();
            $table->string('storage_key');
            $table->string('original_name')->nullable();
            $table->string('mime_type')->nullable();
            $table->unsignedBigInteger('size_bytes')->nullable();
            $table->boolean('is_private')->default(true);
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('user_profiles', function (Blueprint $table): void {
            $table->foreignId('user_id')->primary();
            $table->foreignId('avatar_id')->nullable();
            $table->timestamps();
        });

        Schema::create('vendor_profiles', function (Blueprint $table): void {
            $table->foreignId('user_id')->primary();
            $table->string('slug')->nullable()->unique();
            $table->string('vendor_type');
            $table->json('documents')->nullable();
            $table->json('profile')->nullable();
            $table->json('license')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('products', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('vendor_id');
            $table->foreignId('category_id')->nullable();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('product_type', 30);
            $table->text('description')->nullable();
            $table->unsignedBigInteger('price');
            $table->unsignedInteger('sales_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->string('status', 20)->default('draft');
            $table->timestampTz('published_at')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();
        });
    }
}
