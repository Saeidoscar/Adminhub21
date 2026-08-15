<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('story_id')->nullable()->constrained('stories')->cascadeOnDelete();
            $table->foreignId('blog_id')->nullable()->constrained('blogs')->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('comments')->cascadeOnDelete();
            $table->text('content');
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('dislikes_count')->default(0);
            $table->string('status', 20)->default('pending');
            $table->timestampsTz();
            $table->softDeletesTz();

            $table->index(['story_id', 'status', 'created_at']);
            $table->index(['blog_id', 'status', 'created_at']);
            $table->index(['user_id', 'created_at']);
            $table->index('parent_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE comments ADD CONSTRAINT comments_target_check CHECK ((story_id IS NOT NULL AND blog_id IS NULL) OR (story_id IS NULL AND blog_id IS NOT NULL))');
            DB::statement("ALTER TABLE comments ADD CONSTRAINT comments_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'hidden', 'spam'))");
            DB::statement('ALTER TABLE comments ADD CONSTRAINT comments_likes_count_check CHECK (likes_count >= 0)');
            DB::statement('ALTER TABLE comments ADD CONSTRAINT comments_dislikes_count_check CHECK (dislikes_count >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
