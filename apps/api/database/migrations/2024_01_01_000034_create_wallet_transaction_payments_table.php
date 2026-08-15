<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transaction_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaction_id')->constrained('wallet_transactions')->cascadeOnDelete();
            $table->string('gateway');
            $table->string('ref_num')->nullable();
            $table->string('gateway_token')->nullable();
            $table->string('authority')->nullable();
            $table->string('rrn')->nullable();
            $table->string('terminal_id')->nullable();
            $table->string('card_number_masked')->nullable();
            $table->unsignedInteger('amount');
            $table->unsignedInteger('gateway_fee')->default(0);
            $table->string('status')->default('pending');
            $table->boolean('verified')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->string('payment_url')->nullable();
            $table->json('request_payload')->nullable();
            $table->json('response_payload')->nullable();
            $table->timestamps();
            $table->index(['transaction_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transaction_payments');
    }
};
