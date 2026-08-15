<?php

namespace App\Casts;

use Illuminate\Contracts\Database\Eloquent\CastsAttributes;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;

/**
 * @implements CastsAttributes<array<int, float>|string|null, string|null>
 */
class PgVector implements CastsAttributes
{
    public function get(Model $model, string $key, mixed $value, array $attributes): ?array
    {
        if ($value === null) {
            return null;
        }

        if (is_array($value)) {
            return array_map('floatval', $value);
        }

        $value = trim((string) $value, "[] \t\n\r\0\x0B");

        if ($value === '') {
            return [];
        }

        return array_map('floatval', explode(',', $value));
    }

    public function set(Model $model, string $key, mixed $value, array $attributes): ?string
    {
        if ($value === null) {
            return null;
        }

        if (is_string($value)) {
            return $value;
        }

        if (! is_array($value)) {
            throw new InvalidArgumentException('The pgvector value must be an array or vector literal string.');
        }

        return '['.implode(',', array_map(fn (mixed $item): string => (string) (float) $item, $value)).']';
    }
}
