<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallets', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->primary()
                ->constrained('users')
                ->restrictOnDelete();

            $table->unsignedBigInteger('balance')->default(0);
            $table->unsignedBigInteger('blocked_balance')->default(0);
            $table->unsignedBigInteger('withdrawable_balance')->default(0);
            $table->string('status', 20)->default('active');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('status');
        });

        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->references('user_id')
                ->on('wallets')
                ->restrictOnDelete();

            $table->unsignedBigInteger('amount');
            $table->string('direction', 12);
            $table->string('type', 50)->nullable();
            $table->string('status', 20)->default('pending');

            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'status']);
        });

        Schema::create('wallet_transaction_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')
                ->constrained('wallet_transactions')
                ->restrictOnDelete();

            $table->string('gateway', 20);
            $table->string('ref_num')->nullable();
            $table->string('gateway_token')->nullable();
            $table->string('rrn')->nullable();
            $table->string('terminal_id', 50)->nullable();
            $table->string('card_number_masked', 20)->nullable();
            $table->unsignedBigInteger('amount');
            $table->unsignedBigInteger('gateway_fee')->default(0);
            $table->string('status', 30)->default('pending');
            $table->boolean('verified')->default(false);
            $table->timestampTz('verified_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('transaction_id');
            $table->index(['status', 'created_at']);
            $table->unique(['gateway', 'ref_num']);
            $table->unique(['gateway', 'gateway_token']);
        });

        Schema::create('payout_settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')
                ->unique()
                ->constrained('wallet_transactions')
                ->restrictOnDelete();

            $table->unsignedBigInteger('amount');
            $table->unsignedBigInteger('fee')->default(0);
            $table->unsignedBigInteger('total_payable');
            $table->string('iban', 50);
            $table->string('receipt_link', 500)->nullable();
            $table->string('track_id', 100)->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestampTz('paid_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('status');
            $table->unique('track_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE wallets ADD CONSTRAINT wallets_status_check CHECK (status IN ('active', 'suspended', 'closed'))");
            DB::statement('ALTER TABLE wallets ADD CONSTRAINT wallets_balance_parts_check CHECK (blocked_balance + withdrawable_balance <= balance)');

            DB::statement("ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_direction_check CHECK (direction IN ('deposit', 'withdrawal'))");
            DB::statement("ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'reversed'))");
            DB::statement('ALTER TABLE wallet_transactions ADD CONSTRAINT wallet_transactions_amount_check CHECK (amount > 0)');

            DB::statement("ALTER TABLE wallet_transaction_payments ADD CONSTRAINT wallet_transaction_payments_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))");
            DB::statement('ALTER TABLE wallet_transaction_payments ADD CONSTRAINT wallet_transaction_payments_amount_check CHECK (amount > 0)');

            DB::statement("ALTER TABLE payout_settlements ADD CONSTRAINT payout_settlements_status_check CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled'))");
            DB::statement('ALTER TABLE payout_settlements ADD CONSTRAINT payout_settlements_amount_check CHECK (amount > 0)');
            DB::statement('ALTER TABLE payout_settlements ADD CONSTRAINT payout_settlements_fee_check CHECK (fee <= amount)');
            DB::statement('ALTER TABLE payout_settlements ADD CONSTRAINT payout_settlements_total_payable_check CHECK (total_payable = amount - fee)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_settlements');
        Schema::dropIfExists('wallet_transaction_payments');
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('wallets');
    }
};
