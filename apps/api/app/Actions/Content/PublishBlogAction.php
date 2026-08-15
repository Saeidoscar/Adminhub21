<?php

namespace App\Actions\Content;

use App\Enums\ContentStatus;
use App\Models\Blog;
use Illuminate\Support\Facades\DB;

class PublishBlogAction
{
    public function execute(Blog $blog): Blog
    {
        return DB::transaction(function () use ($blog): Blog {
            $blog->status = ContentStatus::Published->value;
            $blog->published_at = now();
            $blog->save();

            return $blog;
        });
    }
}
