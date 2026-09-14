<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tools', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('category');
            $table->string('icon');
            $table->double('rating')->default(0);
            $table->integer('reviews')->default(0);
            $table->boolean('popular')->default(false);
            $table->integer('price_toman');
            $table->integer('price_usd');
            $table->text('desc_en');
            $table->text('desc_fa');
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['active', 'category']);
            $table->index(['active', 'popular']);
            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tools');
    }
};
