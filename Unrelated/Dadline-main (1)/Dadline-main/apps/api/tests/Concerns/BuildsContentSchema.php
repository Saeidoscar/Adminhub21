<?php

namespace Tests\Concerns;

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

trait BuildsContentSchema
{
    protected function buildContentSchema(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('mobile')->nullable();
            $table->string('first_name')->default('');
            $table->string('last_name')->default('');
            $table->string('role')->default('user');
            $table->boolean('is_vendor')->default(false);
            $table->timestamps();
        });

        Schema::create('legal_categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
        });

        Schema::create('attachments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->string('storage_key');
            $table->boolean('is_private')->default(false);
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('tags', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        foreach (['stories', 'blogs'] as $tableName) {
            Schema::create($tableName, function (Blueprint $table) {
                $table->id();
                $table->unsignedBigInteger('user_id')->nullable();
                $table->unsignedBigInteger('category_id')->nullable();
                $table->unsignedBigInteger('featured_image_id')->nullable();
                $table->string('title');
                $table->string('slug')->unique();
                $table->text('excerpt')->nullable();
                $table->text('content');
                $table->unsignedBigInteger('views_count')->default(0);
                $table->unsignedBigInteger('likes_count')->default(0);
                $table->unsignedBigInteger('dislikes_count')->default(0);
                $table->string('status')->default('draft');
                $table->text('rejection_reason')->nullable();
                $table->timestamp('published_at')->nullable();
                $table->timestamps();
                $table->softDeletes();
            });
        }

        Schema::create('story_tag', function (Blueprint $table) {
            $table->unsignedBigInteger('story_id');
            $table->unsignedBigInteger('tag_id');
            $table->primary(['story_id', 'tag_id']);
        });

        Schema::create('blog_tag', function (Blueprint $table) {
            $table->unsignedBigInteger('blog_id');
            $table->unsignedBigInteger('tag_id');
            $table->primary(['blog_id', 'tag_id']);
        });

        Schema::create('comments', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->unsignedBigInteger('story_id')->nullable();
            $table->unsignedBigInteger('blog_id')->nullable();
            $table->unsignedBigInteger('user_id')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->text('content');
            $table->unsignedBigInteger('likes_count')->default(0);
            $table->unsignedBigInteger('dislikes_count')->default(0);
            $table->string('status')->default('pending');
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('content_reactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->string('reactionable_type');
            $table->unsignedBigInteger('reactionable_id');
            $table->string('type');
            $table->timestamps();
            $table->unique(['user_id', 'reactionable_type', 'reactionable_id']);
        });
    }

    protected function dropContentSchema(): void
    {
        foreach (['content_reactions', 'comments', 'blog_tag', 'story_tag', 'blogs', 'stories', 'tags', 'attachments', 'legal_categories', 'users'] as $table) {
            Schema::dropIfExists($table);
        }
    }
}
