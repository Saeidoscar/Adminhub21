<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_models', function (Blueprint $table) {
            $table->id();
            $table->string('provider');
            $table->string('code')->unique();
            $table->string('name');
            $table->decimal('in_usd', 8, 4);
            $table->decimal('out_usd', 8, 4);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('ai_conversations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('title')->nullable();
            $table->string('type');
            $table->foreignId('model_id')->constrained('ai_models')->cascadeOnDelete();
            $table->string('status')->default('active');
            $table->timestamps();
            $table->index(['user_id', 'status']);
        });

        Schema::create('ai_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('ai_conversations')->cascadeOnDelete();
            $table->text('prompt');
            $table->text('response')->nullable();
            $table->unsignedInteger('in_tokens')->nullable();
            $table->unsignedInteger('out_tokens')->nullable();
            $table->timestamps();
            $table->index(['conversation_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_messages');
        Schema::dropIfExists('ai_conversations');
        Schema::dropIfExists('ai_models');
    }
};
