<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_requests', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('requester_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->foreignId('category_id')
                ->nullable()
                ->constrained('legal_categories')
                ->nullOnDelete();
            $table->unsignedBigInteger('offer_id')->nullable();
            $table->string('type', 20);
            $table->string('vendor_type', 20)->default('all');
            $table->string('title', 500);
            $table->text('description');
            $table->jsonb('details')->nullable();
            $table->string('status', 20)->default('draft');
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index('requester_id', 'idx_service_requests_requester');
            $table->index('category_id');
            $table->index('offer_id');
            $table->index('type');
            $table->index('vendor_type');
            $table->index('status');
        });

        Schema::create('service_offers', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('request_id')
                ->constrained('service_requests')
                ->cascadeOnDelete();
            $table->foreignId('vendor_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->unsignedBigInteger('price');
            $table->text('description');
            $table->foreignId('transaction_id')
                ->nullable()
                ->constrained('wallet_transactions')
                ->nullOnDelete();
            $table->string('status', 10)->default('pending');
            $table->timestampsTz();

            $table->unique(['request_id', 'vendor_id']);
            $table->index('request_id', 'idx_service_offers_request');
            $table->index('vendor_id', 'idx_service_offers_vendor');
            $table->index('status');
        });

        Schema::table('service_requests', function (Blueprint $table): void {
            $table->foreign('offer_id')
                ->references('id')
                ->on('service_offers')
                ->nullOnDelete();
        });

        Schema::create('service_results', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('request_id')
                ->unique()
                ->constrained('service_requests')
                ->cascadeOnDelete();
            $table->foreignId('vendor_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->text('result');
            $table->text('advice')->nullable();
            $table->string('status', 10)->default('draft');
            $table->timestampTz('created_at')->useCurrent();

            $table->index('vendor_id');
            $table->index('status');
        });

        Schema::create('service_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('request_id')
                ->constrained('service_requests')
                ->cascadeOnDelete();
            $table->foreignId('attachment_id')
                ->constrained('attachments')
                ->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['request_id', 'attachment_id']);
            $table->index('request_id');
            $table->index('attachment_id');
        });

        Schema::create('conversations', function (Blueprint $table): void {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->string('subject_type', 30);
            $table->unsignedBigInteger('subject_id');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->unique(['subject_type', 'subject_id']);
            $table->index(['subject_type', 'subject_id'], 'idx_conversations_subject');
            $table->index(['subject_type', 'updated_at']);
        });

        Schema::create('messages', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('conversation_id')
                ->constrained('conversations')
                ->cascadeOnDelete();
            $table->foreignId('sender_id')
                ->constrained('users')
                ->cascadeOnDelete();
            $table->unsignedTinyInteger('type')->default(0);
            $table->text('body');
            $table->unsignedInteger('dadcoin')->nullable();
            $table->timestampTz('read_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index('conversation_id', 'idx_messages_conversation');
            $table->index('sender_id');
            $table->index('type');
        });

        Schema::create('message_attachments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('message_id')
                ->constrained('messages')
                ->cascadeOnDelete();
            $table->foreignId('attachment_id')
                ->constrained('attachments')
                ->cascadeOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['message_id', 'attachment_id']);
            $table->index('message_id');
            $table->index('attachment_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE service_requests ADD CONSTRAINT service_requests_type_check CHECK (type IN ('case', 'lawlink', 'document'))");
            DB::statement("ALTER TABLE service_requests ADD CONSTRAINT service_requests_vendor_type_check CHECK (vendor_type IN ('all', 'judge', 'expert', 'lawyer'))");
            DB::statement("ALTER TABLE service_requests ADD CONSTRAINT service_requests_status_check CHECK (status IN ('draft', 'submitted', 'offer', 'returned', 'handling', 'finished'))");
            DB::statement('ALTER TABLE service_offers ADD CONSTRAINT service_offers_price_check CHECK (price >= 0)');
            DB::statement("ALTER TABLE service_offers ADD CONSTRAINT service_offers_status_check CHECK (status IN ('pending', 'accepted', 'rejected'))");
            DB::statement("ALTER TABLE service_results ADD CONSTRAINT service_results_status_check CHECK (status IN ('draft', 'publish'))");
            DB::statement("ALTER TABLE conversations ADD CONSTRAINT conversations_subject_type_check CHECK (subject_type IN ('service', 'subscription'))");
            DB::statement('ALTER TABLE messages ADD CONSTRAINT messages_type_check CHECK (type IN (0, 1, 2))');
            DB::statement('ALTER TABLE messages ADD CONSTRAINT messages_dadcoin_check CHECK (dadcoin IS NULL OR dadcoin >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('message_attachments');
        Schema::dropIfExists('messages');
        Schema::dropIfExists('conversations');
        Schema::dropIfExists('service_attachments');
        Schema::dropIfExists('service_results');

        Schema::table('service_requests', function (Blueprint $table): void {
            $table->dropForeign(['offer_id']);
        });

        Schema::dropIfExists('service_offers');
        Schema::dropIfExists('service_requests');
    }
};
