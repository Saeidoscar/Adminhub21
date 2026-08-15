<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wallet_transactions', function (Blueprint $table): void {
            $table->jsonb('payload')->default('{}');
        });

        Schema::table('wallet_transaction_payments', function (Blueprint $table): void {
            $table->string('authority', 100)->nullable();
            $table->string('payment_url', 1000)->nullable();
            $table->jsonb('request_payload')->default('{}');
            $table->jsonb('response_payload')->default('{}');
        });

        Schema::create('purchase_intents', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')
                ->constrained('users')
                ->restrictOnDelete();
            $table->foreignId('charge_transaction_id')
                ->nullable()
                ->constrained('wallet_transactions')
                ->nullOnDelete();
            $table->foreignId('purchase_transaction_id')
                ->nullable()
                ->unique()
                ->constrained('wallet_transactions')
                ->nullOnDelete();
            $table->string('purchase_type', 50);
            $table->unsignedBigInteger('purchasable_id')->nullable();
            $table->unsignedBigInteger('vendor_id')->nullable();
            $table->unsignedBigInteger('amount');
            $table->string('wallet_type', 50);
            $table->string('status', 30)->default('pending_wallet');
            $table->jsonb('payload')->default('{}');
            $table->timestampTz('paid_at')->nullable();
            $table->timestampTz('completed_at')->nullable();
            $table->timestampsTz();

            $table->index(['user_id', 'created_at']);
            $table->index(['purchase_type', 'purchasable_id']);
            $table->index(['status', 'created_at']);
        });

        Schema::table('affiliate_commissions', function (Blueprint $table): void {
            $table->timestampTz('release_at')->nullable();
            $table->timestampTz('released_at')->nullable();
            $table->jsonb('payload')->default('{}');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE purchase_intents ADD CONSTRAINT purchase_intents_status_check CHECK (status IN ('pending_wallet', 'pending_gateway', 'paid', 'completed', 'failed', 'cancelled'))");
            DB::statement('ALTER TABLE purchase_intents ADD CONSTRAINT purchase_intents_amount_check CHECK (amount > 0)');
        }
    }

    public function down(): void
    {
        Schema::table('affiliate_commissions', function (Blueprint $table): void {
            $table->dropColumn(['release_at', 'released_at', 'payload']);
        });

        Schema::dropIfExists('purchase_intents');

        Schema::table('wallet_transaction_payments', function (Blueprint $table): void {
            $table->dropColumn(['authority', 'payment_url', 'request_payload', 'response_payload']);
        });

        Schema::table('wallet_transactions', function (Blueprint $table): void {
            $table->dropColumn('payload');
        });
    }
};
