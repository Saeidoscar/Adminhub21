<?php

namespace App\Support;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class UniqueSlugGenerator
{
    /** @param class-string<Model> $modelClass */
    public function generate(string $modelClass, string $value, ?int $ignoreId = null): string
    {
        $base = mb_strtolower(trim($value));
        $base = preg_replace('/[^\p{L}\p{N}]+/u', '-', $base) ?? '';
        $base = trim($base, '-');
        $base = Str::limit($base, 230, '');
        $base = $base !== '' ? $base : Str::lower(Str::random(12));

        $candidate = $base;
        $suffix = 2;

        while ($this->exists($modelClass, $candidate, $ignoreId)) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }

    /** @param class-string<Model> $modelClass */
    private function exists(string $modelClass, string $slug, ?int $ignoreId): bool
    {
        $model = new $modelClass;
        $query = method_exists($model, 'getDeletedAtColumn')
            ? $modelClass::withTrashed()
            : $modelClass::query();

        return $query
            ->where('slug', $slug)
            ->when($ignoreId !== null, fn ($query) => $query->whereKeyNot($ignoreId))
            ->exists();
    }
}
