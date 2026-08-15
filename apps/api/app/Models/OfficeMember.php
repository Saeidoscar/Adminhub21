<?php

namespace App\Models;

use App\Enums\OfficeMemberRole;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeMember extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'office_id',
        'user_id',
        'role',
        'can_access',
        'permissions',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'office_id' => 'integer',
            'user_id' => 'integer',
            'can_access' => 'boolean',
            'permissions' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeAccessible(Builder $query): Builder
    {
        return $query->where('can_access', true);
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function hasPermission(string $permission): bool
    {
        return in_array($permission, $this->permissions ?? [], true);
    }
}
