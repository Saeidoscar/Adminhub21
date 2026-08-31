<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ai_models', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('provider');
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->double('input_cost')->default(0);
            $table->double('output_cost')->default(0);
            $table->integer('context_window')->nullable();
            $table->string('api_base_url')->nullable();
            $table->double('default_temperature')->nullable();
            $table->integer('max_output_tokens')->nullable();
            $table->boolean('supports_streaming')->default(false);
            $table->boolean('supports_vision')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index('provider');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ai_models');
    }
};
