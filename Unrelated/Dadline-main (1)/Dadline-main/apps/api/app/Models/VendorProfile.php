<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Enums\VendorType;


class VendorProfile extends Model
{
    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'slug',
        'vendor_type',
        'documents',
        'profile',
        'license',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'vendor_type' => VendorType::class,
            'documents' => 'array',
            'profile' => 'array',
            'license' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function scopeLawyers(Builder $query): Builder
    {
        return $query->where(
            'vendor_type',
            VendorType::LAWYER
        );
    }

    public function scopeExperts(Builder $query): Builder
    {
        return $query->where(
            'vendor_type',
            VendorType::EXPERT
        );
    }

    public function scopeJudges(Builder $query): Builder
    {
        return $query->where(
            'vendor_type',
            VendorType::JUDGE
        );
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function services(): HasMany
    {
        return $this->hasMany(
            VendorService::class,
            'user_id',
            'user_id'
        );
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function url(): string
    {
        return "/{$this->vendor_type}/{$this->slug}";
    }

    public function profileCompleted(): bool
    {
        return !empty($this->profile['tagline'])
            && !empty($this->profile['biography'])
            && !empty($this->documents);
    }

    public function isLawyer(): bool
    {
        return $this->vendor_type === VendorType::LAWYER;
    }

    public function isExpert(): bool
    {
        return $this->vendor_type === VendorType::EXPERT;
    }


    public function profile(string $key): mixed
    {
        if ($key === null) {
            return $this->profile ?? [];
        }

        return data_get($this->profile, $key);
    }

    public function license(string $key): mixed
    {
        if ($key === null) {
            return $this->license ?? [];
        }

        return data_get($this->license, $key);
    }
    public function licenseExpired(): bool
    {
        $date = data_get($this->license, 'expires_at');

        return $date
            ? now()->gt($date)
            : false;
    }
}
