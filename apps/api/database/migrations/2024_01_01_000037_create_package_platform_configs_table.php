<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('package_platform_configs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('package_id')->constrained()->cascadeOnDelete();
            $table->string('platform');
            $table->unsignedInteger('posts_per_month')->nullable();
            $table->unsignedInteger('stories_per_month')->nullable();
            $table->unsignedInteger('reels_per_month')->nullable();
            $table->unsignedInteger('comments_per_month')->nullable();
            $table->json('deliverables')->nullable();
            $table->timestamps();
            $table->unique(['package_id', 'platform']);
            $table->index(['package_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('package_platform_configs');
    }
};
