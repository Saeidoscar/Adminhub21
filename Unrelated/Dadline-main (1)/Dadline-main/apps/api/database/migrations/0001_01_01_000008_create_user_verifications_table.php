<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_verifications', function (Blueprint $table) {

            $table->foreignId('user_id')
                ->primary()
                ->constrained()
                ->cascadeOnDelete();

            // 0: none
            // 1: mobile
            // 2: national
            // 3: bank
            // 4: video
            $table->unsignedTinyInteger('verified_level')
                ->default(0);

            // تایید موبایل
            $table->boolean('mobile_verified')
                ->default(false);

            $table->timestampTz('mobile_verified_at')
                ->nullable();


            // تایید هویت
            $table->boolean('national_verified')
                ->default(false);

            $table->jsonb('national_data')
                ->nullable();

            $table->timestampTz('national_verified_at')
                ->nullable();


            // تایید حساب بانکی
            $table->boolean('bank_verified')
                ->default(false);

            $table->timestampTz('bank_verified_at')
                ->nullable();


            $table->timestampsTz();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_verifications');
    }
};
