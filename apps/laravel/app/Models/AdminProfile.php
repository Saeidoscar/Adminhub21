<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdminProfile extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'user_id',
        'photo',
        'rating',
        'reviews',
        'verified',
        'insured',
        'monthly_toman',
        'monthly_usd',
        'bio_en',
        'bio_fa',
        'skills_en',
        'skills_fa',
        'platforms',
    ];

    protected $casts = [
        'rating' => 'float',
        'reviews' => 'integer',
        'verified' => 'boolean',
        'insured' => 'boolean',
        'monthly_toman' => 'integer',
        'monthly_usd' => 'integer',
        'skills_en' => 'array',
        'skills_fa' => 'array',
        'platforms' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function packages(): HasMany
    {
        return $this->hasMany(Package::class, 'admin_id');
    }

    public function customOffers(): HasMany
    {
        return $this->hasMany(CustomOffer::class, 'admin_id');
    }

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class, 'admin_id');
    }

    public function portfolioItems(): HasMany
    {
        return $this->hasMany(PortfolioItem::class, 'admin_id');
    }

    public function cases(): HasMany
    {
        return $this->hasMany(SupportCase::class, 'admin_id');
    }
}
