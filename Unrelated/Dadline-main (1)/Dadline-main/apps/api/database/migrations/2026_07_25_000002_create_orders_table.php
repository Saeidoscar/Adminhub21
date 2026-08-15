<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('buyer_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->foreignId('vendor_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('discount')->default(0);
            $table->unsignedBigInteger('vat')->default(0);
            $table->unsignedBigInteger('total_price');
            $table->unsignedBigInteger('commission')->default(0);
            $table->unsignedBigInteger('vendor_share')->default(0);
            $table->string('status', 25)->default('pending');
            $table->timestampTz('paid_at')->nullable();
            $table->timestampTz('canceled_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index(['buyer_id', 'created_at']);
            $table->index(['vendor_id', 'created_at']);
            $table->index(['status', 'created_at']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN ('pending', 'paid', 'fulfilled', 'canceled', 'refunded'))");
            DB::statement('ALTER TABLE orders ADD CONSTRAINT orders_subtotal_check CHECK (subtotal >= 0)');
            DB::statement('ALTER TABLE orders ADD CONSTRAINT orders_discount_check CHECK (discount >= 0 AND discount <= subtotal)');
            DB::statement('ALTER TABLE orders ADD CONSTRAINT orders_vat_check CHECK (vat >= 0)');
            DB::statement('ALTER TABLE orders ADD CONSTRAINT orders_total_price_check CHECK (total_price >= 0)');
            DB::statement('ALTER TABLE orders ADD CONSTRAINT orders_commission_check CHECK (commission >= 0)');
            DB::statement('ALTER TABLE orders ADD CONSTRAINT orders_vendor_share_check CHECK (vendor_share >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
