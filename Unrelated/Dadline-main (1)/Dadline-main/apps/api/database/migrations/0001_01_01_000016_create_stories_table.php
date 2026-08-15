<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('legal_categories')->nullOnDelete();
            $table->foreignId('featured_image_id')->nullable()->constrained('attachments')->nullOnDelete();
            $table->string('title', 500);
            $table->string('slug', 255)->unique();
            $table->text('excerpt')->nullable();
            $table->longText('content');
            $table->unsignedBigInteger('views_count')->default(0);
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->string('status', 20)->default('draft');
            $table->text('rejection_reason')->nullable();
            $table->timestampTz('published_at')->nullable();
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['user_id', 'status']);
            $table->index(['category_id', 'status']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE stories ADD CONSTRAINT stories_status_check CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'archived'))");
            DB::statement('ALTER TABLE stories ADD CONSTRAINT stories_views_count_check CHECK (views_count >= 0)');
            DB::statement('ALTER TABLE stories ADD CONSTRAINT stories_likes_count_check CHECK (likes_count >= 0)');
            DB::statement("CREATE INDEX stories_published_index ON stories (published_at DESC) WHERE status = 'published' AND deleted_at IS NULL");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('stories');
    }
};
