<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class ShortLink extends Model
{
    public const SHORT_CODE_LENGTH = 6;

    public $timestamps = false;

    protected $fillable = [
        'id',
        'short_code',
        'original_url',
        'clicks',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'clicks' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (ShortLink $shortLink): void {
            if (filled($shortLink->short_code)) {
                return;
            }

            do {
                $shortLink->short_code = Str::random(self::SHORT_CODE_LENGTH);
            } while (
                static::query()
                    ->where('short_code', $shortLink->short_code)
                    ->exists()
            );
        });
    }

    public static function findOrCreateForUrl(string $originalUrl): self
    {
        return static::query()->firstOrCreate([
            'original_url' => $originalUrl,
        ]);
    }
}
