<?php

namespace App\Actions\Content;

use App\Models\Tag;
use App\Support\UniqueSlugGenerator;

class SaveTagAction
{
    public function __construct(private readonly UniqueSlugGenerator $slugs) {}

    public function execute(?Tag $tag, array $data): Tag
    {
        $tag ??= new Tag;

        if (array_key_exists('slug', $data) || ! $tag->exists) {
            $data['slug'] = $this->slugs->generate(
                Tag::class,
                ($data['slug'] ?? null) ?: ($data['name'] ?? $tag->name),
                $tag->getKey(),
            );
        }

        $tag->fill($data)->save();

        return $tag->refresh();
    }
}
