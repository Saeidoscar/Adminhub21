<?php

namespace App\Actions\Content;

use App\Models\Blog;
use App\Models\LegalCategory;
use App\Models\Tag;
use App\Models\User;
use App\Support\UniqueSlugGenerator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class SaveBlogAction
{
    public function __construct(private readonly UniqueSlugGenerator $slugs) {}

    public function execute(?Blog $blog, User $author, array $data): Blog
    {
        return DB::transaction(function () use ($blog, $author, $data) {
            $blog ??= new Blog;
            $shouldSyncTags = array_key_exists('tag_slugs', $data);
            $tagSlugs = Arr::pull($data, 'tag_slugs', []);
            $categorySlug = Arr::pull($data, 'category_slug');

            if ($categorySlug !== null) {
                $data['category_id'] = LegalCategory::query()->where('slug', $categorySlug)->firstOrFail()->getKey();
            }

            if (! $blog->exists) {
                $blog->user_id = $author->getKey();
            }

            if (array_key_exists('slug', $data) || ! $blog->exists) {
                $data['slug'] = $this->slugs->generate(
                    Blog::class,
                    ($data['slug'] ?? null) ?: ($data['title'] ?? $blog->title),
                    $blog->getKey(),
                );
            }

            $blog->fill($data);
            $blog->save();
            if ($shouldSyncTags) {
                $blog->tags()->sync(Tag::query()->whereIn('slug', $tagSlugs)->pluck('id'));
            }

            return $blog->load(['author', 'legalCategory', 'featuredImage', 'tags']);
        });
    }
}
