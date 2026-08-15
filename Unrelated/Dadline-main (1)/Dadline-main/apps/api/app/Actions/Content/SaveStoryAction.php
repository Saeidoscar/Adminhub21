<?php

namespace App\Actions\Content;

use App\Models\LegalCategory;
use App\Models\Story;
use App\Models\Tag;
use App\Models\User;
use App\Support\UniqueSlugGenerator;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;

class SaveStoryAction
{
    public function __construct(private readonly UniqueSlugGenerator $slugs) {}

    public function execute(?Story $story, User $author, array $data): Story
    {
        return DB::transaction(function () use ($story, $author, $data) {
            $story ??= new Story;
            $shouldSyncTags = array_key_exists('tag_slugs', $data);
            $tagSlugs = Arr::pull($data, 'tag_slugs', []);
            $categorySlug = Arr::pull($data, 'category_slug');

            if ($categorySlug !== null) {
                $data['category_id'] = LegalCategory::query()->where('slug', $categorySlug)->firstOrFail()->getKey();
            }

            if (! $story->exists) {
                $story->user_id = $author->getKey();
            }

            if (array_key_exists('slug', $data) || ! $story->exists) {
                $data['slug'] = $this->slugs->generate(
                    Story::class,
                    ($data['slug'] ?? null) ?: ($data['title'] ?? $story->title),
                    $story->getKey(),
                );
            }

            $story->fill($data);
            $story->save();
            if ($shouldSyncTags) {
                $story->tags()->sync(Tag::query()->whereIn('slug', $tagSlugs)->pluck('id'));
            }

            return $story->load(['author', 'legalCategory', 'featuredImage', 'tags']);
        });
    }
}
