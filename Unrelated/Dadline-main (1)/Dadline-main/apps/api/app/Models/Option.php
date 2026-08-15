<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Option extends Model
{
    protected $fillable = [
        'group',
        'key',
        'value',
        'autoload',
    ];

    protected $casts = [
        'value' => 'array',
        'autoload' => 'boolean',
    ];

    /**
     * دریافت مقدار یک option
     */
    public static function get(
        string $key,
        mixed $default = null
    ): mixed {

        return Cache::remember(
            "option:{$key}",
            now()->addHours(24),
            function () use ($key, $default) {
                return static::query()
                    ->where('key', $key)
                    ->first(['value'])
                    ?->value ?? $default;
            }
        );
    }

    /**
     * ذخیره یا بروزرسانی option
     */
    public static function set(
        string $key,
        mixed $value,
        string $group = 'general',
        bool $autoload = false
    ): static {
        $option = static::updateOrCreate(
            [
                'key' => $key,
            ],
            [
                'group' => $group,
                'value' => $value,
                'autoload' => $autoload,
            ]
        );

        Cache::forget("option:{$key}");

        return $option;

    }

    /**
     * حذف option
     */
    public static function remove(
        string $key
    ): bool {
        Cache::forget("option:{$key}");

        return static::where('key', $key)
            ->delete();
    }

    /**
     * Scope گروه
     */
    public function scopeGroup(
        $query,
        string $group
    ) {

        return $query->where('group', $group);

    }

    /**
     * Scope گزینه‌های autoload
     */
    public function scopeAutoload($query)
    {
        return $query->where('autoload', true);
    }
}
