<?php

namespace App\Actions\Content;

use App\Models\Tag;
use Illuminate\Support\Facades\DB;

class ManageTagsAction
{
    /**
     * @param  array<int, array{name: string, slug: string, type?: string|null}>  $tags
     * @return array<int, Tag>
     */
    public function execute(array $tags): array
    {
        return DB::transaction(function () use ($tags): array {
            $results = [];

            foreach ($tags as $tagData) {
                $results[] = Tag::query()->updateOrCreate(
                    ['slug' => $tagData['slug']],
                    array_merge($tagData, ['type' => $tagData['type'] ?? null])
                );
            }

            return $results;
        });
    }
}
