<?php

namespace Tests\Unit;

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class MigratePart4Test extends TestCase
{
    /** @var list<Migration> */
    private array $migrations = [];

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'database.connections.legacy' => [
                'driver' => 'sqlite',
                'database' => ':memory:',
                'prefix' => '',
                'foreign_key_constraints' => true,
            ],
        ]);
        DB::purge('legacy');

        Schema::create('users', function (Blueprint $table) {
            $table->id();
        });
        Schema::create('legal_categories', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
        });

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

        $this->buildLegacySchema();
        $this->seedTargetReferences();
        $this->seedLegacyData();
    }

    protected function tearDown(): void
    {
        Schema::connection('legacy')->dropIfExists('ad_dad_product_orders');
        Schema::connection('legacy')->dropIfExists('ad_dad_product_doc');
        Schema::connection('legacy')->dropIfExists('ad_posts');
        DB::disconnect('legacy');

        foreach (array_reverse($this->migrations) as $migration) {
            $migration->down();
        }

        Schema::dropIfExists('legal_categories');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_part_four_migrates_products_versions_and_valid_orders_idempotently(): void
    {
        $this->artisan('dadline:migrate', ['--part' => '4'])
            ->expectsOutputToContain('Products migrated: 2; already existed: 0.')
            ->expectsOutputToContain('Product orders migrated: 1; already existed: 0.')
            ->expectsOutputToContain('Product orders skipped because a reference was missing: 1.')
            ->assertSuccessful();

        $this->assertDatabaseHas('products', [
            'id' => 24,
            'vendor_id' => 20,
            'category_id' => 1,
            'slug' => 'legacy-product-slug',
            'product_type' => 'contract',
            'price' => 100000,
            'sales_count' => 1,
            'views_count' => 15,
            'status' => 'published',
        ]);
        $this->assertDatabaseHas('products', [
            'id' => 108,
            'vendor_id' => 20,
            'status' => 'draft',
            'sales_count' => 0,
        ]);
        $this->assertDatabaseHas('product_versions', [
            'product_id' => 24,
            'version' => 1,
            'content' => 'Purchased contract content',
        ]);
        $this->assertDatabaseHas('orders', [
            'id' => 1,
            'buyer_id' => 10,
            'vendor_id' => 20,
            'subtotal' => 100000,
            'discount' => 10000,
            'vat' => 3600,
            'total_price' => 93600,
            'commission' => 36000,
            'vendor_share' => 54000,
            'status' => 'fulfilled',
        ]);
        $this->assertDatabaseHas('order_items', [
            'id' => 1,
            'order_id' => 1,
            'product_id' => 24,
            'vendor_id' => 20,
            'unit_price' => 100000,
            'discount' => 10000,
            'total_price' => 90000,
        ]);
        $this->assertDatabaseMissing('orders', ['id' => 7]);
        $this->assertDatabaseCount('products', 2);
        $this->assertDatabaseCount('product_versions', 2);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);

        $fallbackSlug = DB::table('products')->where('id', 108)->value('slug');
        $this->assertNotEmpty($fallbackSlug);

        $this->artisan('dadline:migrate', ['--part' => '4'])
            ->expectsOutputToContain('Products migrated: 0; already existed: 2.')
            ->expectsOutputToContain('Product orders migrated: 0; already existed: 1.')
            ->assertSuccessful();

        $this->assertDatabaseHas('products', ['id' => 24, 'sales_count' => 1]);
        $this->assertDatabaseCount('orders', 1);
        $this->assertDatabaseCount('order_items', 1);
    }

    public function test_part_four_dry_run_does_not_write_any_data(): void
    {
        $this->artisan('dadline:migrate', [
            '--part' => '4',
            '--dry-run' => true,
        ])->assertSuccessful();

        $this->assertDatabaseCount('products', 0);
        $this->assertDatabaseCount('product_versions', 0);
        $this->assertDatabaseCount('orders', 0);
        $this->assertDatabaseCount('order_items', 0);
    }

    private function buildLegacySchema(): void
    {
        Schema::connection('legacy')->create('ad_posts', function (Blueprint $table) {
            $table->unsignedBigInteger('ID')->primary();
            $table->string('post_name')->default('');
            $table->dateTime('post_date')->nullable();
        });

        Schema::connection('legacy')->create('ad_dad_product_doc', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->string('doc_title');
            $table->text('doc_description');
            $table->text('doc_content');
            $table->string('doc_type');
            $table->string('doc_category');
            $table->bigInteger('price');
            $table->string('status');
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
            $table->integer('sales')->default(0);
            $table->unsignedBigInteger('post_id')->nullable();
            $table->integer('views')->default(0);
            $table->text('doc_file')->nullable();
        });

        Schema::connection('legacy')->create('ad_dad_product_orders', function (Blueprint $table) {
            $table->unsignedBigInteger('id')->primary();
            $table->unsignedBigInteger('user_id');
            $table->bigInteger('vendor_id');
            $table->bigInteger('doc_id');
            $table->bigInteger('total_price');
            $table->bigInteger('discount');
            $table->bigInteger('net_price');
            $table->bigInteger('vat');
            $table->bigInteger('commission');
            $table->bigInteger('vendor_share');
            $table->string('status');
            $table->dateTime('created_at')->nullable();
            $table->dateTime('updated_at')->nullable();
        });
    }

    private function seedTargetReferences(): void
    {
        DB::table('users')->insert([
            ['id' => 10],
            ['id' => 20],
        ]);
        DB::table('legal_categories')->insert([
            'id' => 1,
            'slug' => 'commercial',
        ]);
    }

    private function seedLegacyData(): void
    {
        DB::connection('legacy')->table('ad_posts')->insert([
            'ID' => 500,
            'post_name' => 'legacy-product-slug',
            'post_date' => '2025-03-12 04:11:07',
        ]);
        DB::connection('legacy')->table('ad_dad_product_doc')->insert([
            [
                'id' => 24,
                'user_id' => 20,
                'doc_title' => 'Legacy published product',
                'doc_description' => 'Product description',
                'doc_content' => 'Purchased contract content',
                'doc_type' => 'contract',
                'doc_category' => 'commercial',
                'price' => 100000,
                'status' => 'publish',
                'created_at' => '2025-03-12 04:11:07',
                'updated_at' => '2025-03-13 04:11:07',
                'sales' => 58,
                'post_id' => 500,
                'views' => 15,
            ],
            [
                'id' => 108,
                'user_id' => 20,
                'doc_title' => 'محصول پیش نویس',
                'doc_description' => 'Draft description',
                'doc_content' => 'Draft content',
                'doc_type' => 'contract',
                'doc_category' => 'commercial',
                'price' => 200000,
                'status' => 'draft',
                'created_at' => '2026-07-01 10:00:00',
                'updated_at' => '2026-07-01 10:00:00',
                'sales' => 20,
                'post_id' => null,
                'views' => 5,
            ],
        ]);
        DB::connection('legacy')->table('ad_dad_product_orders')->insert([
            [
                'id' => 1,
                'user_id' => 10,
                'vendor_id' => 20,
                'doc_id' => 24,
                'total_price' => 100000,
                'discount' => 10000,
                'net_price' => 90000,
                'vat' => 3600,
                'commission' => 36000,
                'vendor_share' => 54000,
                'status' => 'completed',
                'created_at' => '2025-03-13 03:52:12',
                'updated_at' => '2025-03-13 03:52:12',
            ],
            [
                'id' => 7,
                'user_id' => 999,
                'vendor_id' => 0,
                'doc_id' => 0,
                'total_price' => 0,
                'discount' => 0,
                'net_price' => 0,
                'vat' => 0,
                'commission' => 0,
                'vendor_share' => 0,
                'status' => 'completed',
                'created_at' => '2025-03-26 16:13:11',
                'updated_at' => '2025-03-26 16:13:11',
            ],
        ]);
    }
}
