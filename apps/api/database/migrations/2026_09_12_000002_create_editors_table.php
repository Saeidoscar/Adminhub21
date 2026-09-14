<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('editors', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->string('name_en');
            $table->string('name_fa');
            $table->string('photo');
            $table->string('specialty');
            $table->double('rating')->default(0);
            $table->integer('reviews')->default(0);
            $table->integer('projects')->default(0);
            $table->string('delivery');
            $table->integer('rate_toman');
            $table->integer('rate_usd');
            $table->text('bio_en');
            $table->text('bio_fa');
            $table->boolean('active')->default(true);
            $table->timestamps();

            $table->index(['active', 'specialty']);
            $table->index('rating');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('editors');
    }
};
