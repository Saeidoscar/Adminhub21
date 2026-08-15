<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('financials', function (Blueprint $table) {
            $table->id();
            $table->string('direction', 10);
            $table->unsignedBigInteger('gross_amount');
            $table->unsignedBigInteger('vat_amount')->default(0);
            $table->unsignedBigInteger('net_amount');
            $table->string('status', 12)->default('accepted');
            $table->unsignedBigInteger('item_id')->nullable();
            $table->jsonb('payload')->default('{}');
            $table->timestampTz('occurred_at')->useCurrent();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index(['direction', 'occurred_at']);
            $table->index(['status', 'occurred_at']);
            $table->index('item_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE financials ADD CONSTRAINT financials_direction_check CHECK (direction IN ('income', 'expense'))");
            DB::statement("ALTER TABLE financials ADD CONSTRAINT financials_status_check CHECK (status IN ('pending', 'accepted', 'returned', 'canceled'))");
            DB::statement('ALTER TABLE financials ADD CONSTRAINT financials_gross_amount_check CHECK (gross_amount >= 0)');
            DB::statement('ALTER TABLE financials ADD CONSTRAINT financials_vat_amount_check CHECK (vat_amount >= 0)');
            DB::statement('ALTER TABLE financials ADD CONSTRAINT financials_net_amount_check CHECK (net_amount >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('financials');
    }
};
