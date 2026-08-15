<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bot_links', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->primary()
                ->constrained()
                ->cascadeOnDelete();
            $table->bigInteger('telegram_id')->nullable()->unique();
            $table->bigInteger('eitaa_id')->nullable()->unique();
            $table->bigInteger('bale_id')->nullable()->unique();
            $table->string('auth_token')->nullable()->unique();
            $table->string('fcm_token')->nullable()->unique();
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bot_links');
    }
};
