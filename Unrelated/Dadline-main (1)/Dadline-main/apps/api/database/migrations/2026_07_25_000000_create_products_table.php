<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
        }

        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('legal_categories')
                ->nullOnDelete();
            $table->string('title');
            $table->string('slug')->unique();
            $table->string('product_type', 30);
            $table->text('description')->nullable();
            $table->longText('content')->nullable();
            $table->unsignedBigInteger('price')->comment('Amount in toman');
            $table->unsignedInteger('sales_count')->default(0);
            $table->unsignedInteger('views_count')->default(0);
            $table->string('status', 20)->default('draft');
            $table->timestampTz('published_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
            $table->softDeletesTz();

            $table->index(['vendor_id', 'status']);
            $table->index(['category_id', 'status']);
            $table->index(['status', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE products ADD CONSTRAINT products_product_type_check CHECK (product_type IN ('petition', 'statement', 'bill', 'complaint', 'contract', 'letter'))");
            DB::statement("ALTER TABLE products ADD CONSTRAINT products_status_check CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'paused', 'archived'))");
            DB::statement('ALTER TABLE products ADD CONSTRAINT products_price_check CHECK (price >= 0)');
            DB::statement('ALTER TABLE products ADD CONSTRAINT products_sales_count_check CHECK (sales_count >= 0)');
            DB::statement('ALTER TABLE products ADD CONSTRAINT products_views_count_check CHECK (views_count >= 0)');
            DB::statement('CREATE INDEX products_title_trgm_index ON products USING gin (title gin_trgm_ops)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
