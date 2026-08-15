<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {

            $table->foreignId('user_id')
                ->primary()
                ->constrained()
                ->cascadeOnDelete();
            $table->string('national_id', 11)->nullable();
            $table->string('birth_date', 10)->nullable();
            $table->string('iban', 34)->nullable();
            $table->foreignId('city_id')
                ->nullable()
                ->constrained('cities')
                ->nullOnDelete();

            $table->foreignId('referrer_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            $table->foreignId('avatar_id')
                ->nullable()
                ->constrained('attachments')
                ->nullOnDelete();

            $table->foreignId('signature_id')
                ->nullable()
                ->constrained('attachments')
                ->nullOnDelete();

            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
