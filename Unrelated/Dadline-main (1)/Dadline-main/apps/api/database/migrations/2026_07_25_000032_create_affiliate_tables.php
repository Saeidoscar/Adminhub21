<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();

            $table->string('referral_code', 6)->unique();
            $table->decimal('commission_rate', 5, 2)->default('0.10');
            $table->string('status', 16)->default('active');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('status');
        });

        Schema::create('affiliate_commissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('affiliate_id')
                ->constrained('affiliates')
                ->restrictOnDelete();

            $table->decimal('rate', 7, 4);
            $table->unsignedBigInteger('amount');

            $table->foreignId('source_tx_id')
                ->unique()
                ->constrained('wallet_transactions')
                ->restrictOnDelete();
            $table->foreignId('commission_tx_id')
                ->nullable()
                ->unique()
                ->constrained('wallet_transactions')
                ->restrictOnDelete();

            $table->string('status', 16)->default('pending');

            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('affiliate_id');
            $table->index('status');
            $table->index('created_at');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE affiliates ADD CONSTRAINT affiliates_status_check CHECK (status IN ('active', 'deactivated', 'banned'))");
            DB::statement('ALTER TABLE affiliates ADD CONSTRAINT affiliates_commission_rate_check CHECK (commission_rate >= 0 AND commission_rate <= 1)');

            DB::statement("ALTER TABLE affiliate_commissions ADD CONSTRAINT affiliate_commissions_status_check CHECK (status IN ('pending', 'approved', 'reversed', 'paid'))");
            DB::statement('ALTER TABLE affiliate_commissions ADD CONSTRAINT affiliate_commissions_rate_check CHECK (rate >= 0 AND rate <= 1)');
            DB::statement('ALTER TABLE affiliate_commissions ADD CONSTRAINT affiliate_commissions_amount_check CHECK (amount > 0)');
            DB::statement('ALTER TABLE affiliate_commissions ADD CONSTRAINT affiliate_commissions_distinct_transactions_check CHECK (commission_tx_id IS NULL OR commission_tx_id <> source_tx_id)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_commissions');
        Schema::dropIfExists('affiliates');
    }
};
