<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payout_settlements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('wallet_transactions')->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->unsignedInteger('fee')->default(0);
            $table->unsignedInteger('total_payable');
            $table->string('iban')->nullable();
            $table->string('provider')->nullable();
            $table->string('unique_code')->nullable();
            $table->string('receipt_link')->nullable();
            $table->string('track_id')->nullable();
            $table->string('crypto_address')->nullable();
            $table->json('provider_data')->nullable();
            $table->string('failure_reason')->nullable();
            $table->timestamp('scheduled_for')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('last_checked_at')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
            $table->index(['transaction_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payout_settlements');
    }
};
