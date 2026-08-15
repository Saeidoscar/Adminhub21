<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_verifications', function (Blueprint $table): void {
            $table->jsonb('bank_data')->nullable()->after('bank_verified_at');
            $table->timestampTz('iban_verified_at')->nullable()->after('bank_data');
            $table->jsonb('iban_data')->nullable()->after('iban_verified_at');
            $table->timestampTz('identity_locked_at')->nullable()->after('national_verified_at');
        });

        Schema::create('external_service_requests', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('purchase_intent_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('wallet_transaction_id')->nullable()->constrained('wallet_transactions')->nullOnDelete();
            $table->string('provider', 40);
            $table->string('service', 80);
            $table->string('status', 20)->default('pending');
            $table->unsignedSmallInteger('http_status')->nullable();
            $table->integer('provider_code')->nullable();
            $table->text('provider_message')->nullable();
            $table->char('request_fingerprint', 64);
            $table->jsonb('request_payload')->nullable();
            $table->jsonb('response_payload')->nullable();
            $table->unsignedInteger('duration_ms')->nullable();
            $table->boolean('retryable')->default(false);
            $table->boolean('billable')->default(false);
            $table->unsignedBigInteger('billed_amount')->nullable();
            $table->timestampTz('responded_at')->nullable();
            $table->timestampTz('billed_at')->nullable();
            $table->timestampsTz();

            $table->index(['provider', 'service', 'created_at']);
            $table->index(['provider', 'service', 'request_fingerprint']);
            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->index(['billable', 'billed_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('external_service_requests');

        Schema::table('user_verifications', function (Blueprint $table): void {
            $table->dropColumn(['bank_data', 'iban_verified_at', 'iban_data', 'identity_locked_at']);
        });
    }
};
