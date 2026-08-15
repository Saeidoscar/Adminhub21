<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')
                ->constrained('orders')
                ->cascadeOnDelete();
            $table->foreignId('product_id')
                ->constrained('products')
                ->restrictOnDelete();
            $table->foreignId('product_version_id')
                ->constrained('product_versions')
                ->restrictOnDelete();
            $table->foreignId('vendor_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->string('product_title');
            $table->string('product_type', 30);
            $table->unsignedBigInteger('unit_price');
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('total_price');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('order_id');
            $table->index('product_id');
            $table->index('product_version_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE order_items ADD CONSTRAINT order_items_product_type_check CHECK (product_type IN ('petition', 'statement', 'bill', 'complaint', 'contract', 'letter'))");
            DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_unit_price_check CHECK (unit_price >= 0)');
            DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_discount_check CHECK (discount >= 0 AND discount <= unit_price)');
            DB::statement('ALTER TABLE order_items ADD CONSTRAINT order_items_total_price_check CHECK (total_price = unit_price - discount)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('order_items');
    }
};
