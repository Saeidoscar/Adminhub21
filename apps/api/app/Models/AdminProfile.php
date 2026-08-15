<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdminProfile extends Model
{
    protected $table = 'admin_profiles';

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'photo_id',
        'insurance_document_id',
        'platforms',
        'skills',
        'rating',
        'insurance_number',
        'years_experience',
        'hourly_rate',
        'portfolio_summary',
        'bio',
        'verified_at',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'photo_id' => 'integer',
            'insurance_document_id' => 'integer',
            'platforms' => 'array',
            'skills' => 'array',
            'rating' => 'decimal:2',
            'years_experience' => 'integer',
            'hourly_rate' => 'decimal:2',
            'verified_at' => 'datetime',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
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

    public function photo(): BelongsTo
    {
        return $this->belongsTo(Attachment::class, 'photo_id');
    }

    public function insuranceDocument(): BelongsTo
    {
        return $this->belongsTo(Attachment::class, 'insurance_document_id');
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class, 'user_id');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'client_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'target_user_id', 'user_id');
    }

    public function portfolios(): HasMany
    {
        return $this->hasMany(Portfolio::class, 'user_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Scopes
    |--------------------------------------------------------------------------
    */

    public function scopeVerified(Builder $query): Builder
    {
        return $query->whereNotNull('verified_at');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }
}
