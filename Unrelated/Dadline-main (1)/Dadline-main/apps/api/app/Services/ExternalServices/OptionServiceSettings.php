<?php

namespace App\Services\ExternalServices;

use App\Models\Option;

class OptionServiceSettings
{
    public function string(string $key, ?string $default = null): ?string
    {
        $value = Option::get($key, $default);

        if (is_array($value)) {
            return $default;
        }

        $value = trim((string) $value);

        return $value === '' ? $default : $value;
    }

    public function integer(string $key, int $default = 0): int
    {
        $value = Option::get($key, $default);

        return is_numeric($value) ? (int) $value : $default;
    }

    public function enabled(string $key, bool $default = false): bool
    {
        $value = Option::get($key, $default ? '1' : '0');

        return in_array($value, [true, 1, '1', 'true', 'on', 'yes'], true);
    }
}
