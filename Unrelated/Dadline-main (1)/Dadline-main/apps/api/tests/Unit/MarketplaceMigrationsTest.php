<?php

namespace Tests\Unit;

use App\Enums\OrderStatus;
use App\Enums\ProductStatus;
use App\Enums\ProductType;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVersion;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MarketplaceMigrationsTest extends TestCase
{
    /** @var list<Migration> */
    private array $migrations = [];

    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('users', function (Blueprint $table) {
            $table->id();
        });
        Schema::create('legal_categories', function (Blueprint $table) {
            $table->id();
        });
    }

    protected function tearDown(): void
    {
        foreach (array_reverse($this->migrations) as $migration) {
            $migration->down();
        }

        Schema::dropIfExists('legal_categories');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_marketplace_migrations_create_the_expected_schema(): void
    {
        foreach ([
            '2026_07_25_000000_create_products_table.php',
            '2026_07_25_000001_create_product_versions_table.php',
            '2026_07_25_000002_create_orders_table.php',
            '2026_07_25_000003_create_order_items_table.php',
        ] as $file) {
            $migration = require database_path('migrations/'.$file);
            $migration->up();
            $this->migrations[] = $migration;
        }

        $this->assertTrue(Schema::hasColumns('products', [
            'vendor_id',
            'category_id',
            'slug',
            'product_type',
            'price',
            'status',
            'deleted_at',
        ]));
        $this->assertFalse(Schema::hasColumn('products', 'content'));
        $this->assertTrue(Schema::hasColumns('product_versions', [
            'product_id',
            'version',
            'content',
            'created_at',
        ]));
        $this->assertTrue(Schema::hasColumns('orders', [
            'buyer_id',
            'vendor_id',
            'subtotal',
            'discount',
            'vat',
            'total_price',
            'commission',
            'vendor_share',
            'status',
        ]));
        $this->assertTrue(Schema::hasColumns('order_items', [
            'order_id',
            'product_id',
            'product_version_id',
            'vendor_id',
            'product_title',
            'product_type',
            'unit_price',
            'discount',
            'total_price',
        ]));
    }

    public function test_marketplace_models_cast_enums_and_hide_version_content(): void
    {
        $product = new Product([
            'product_type' => ProductType::Contract,
            'status' => ProductStatus::Published,
        ]);
        $version = new ProductVersion([
            'version' => 1,
            'content' => 'private purchased content',
        ]);
        $order = new Order([
            'status' => OrderStatus::Paid,
        ]);
        $item = new OrderItem([
            'product_type' => ProductType::Contract,
        ]);

        $this->assertSame(ProductType::Contract, $product->product_type);
        $this->assertSame(ProductStatus::Published, $product->status);
        $this->assertSame(OrderStatus::Paid, $order->status);
        $this->assertSame(ProductType::Contract, $item->product_type);
        $this->assertArrayNotHasKey('content', $version->toArray());
        $this->assertSame('slug', $product->getRouteKeyName());
    }
}
