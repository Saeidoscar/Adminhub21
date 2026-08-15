<?php

namespace App\Models;

use App\Enums\OfficeStatus;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Office extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'owner_id',
        'name',
        'status',
        'holiday',
    ];

    protected function casts(): array
    {
        return [
            'owner_id' => 'integer',
            'holiday' => 'array',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): HasMany
    {
        return $this->hasMany(OfficeMember::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(OfficeContact::class);
    }

    public function cases(): HasMany
    {
        return $this->hasMany(OfficeCase::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(OfficeTransaction::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(OfficeAttachment::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', OfficeStatus::Active->value);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isActive(): bool
    {
        return $this->status === OfficeStatus::Active->value;
    }
}
