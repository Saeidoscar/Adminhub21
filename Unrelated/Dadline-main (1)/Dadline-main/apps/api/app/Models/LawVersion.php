<?php

namespace App\Models;

use App\Enums\LawVersionStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LawVersion extends Model
{
    protected $fillable = [
        'id',
        'label',
        'status',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => LawVersionStatus::class,
            'published_at' => 'datetime',
        ];
    }

    public function categories(): HasMany
    {
        return $this->hasMany(LawCategory::class, 'version_id');
    }

    public function scopePublished($query)
    {
        return $query->where('status', LawVersionStatus::PUBLISHED);
    }

    public function scopeDraft($query)
    {
        return $query->where('status', LawVersionStatus::DRAFT);
    }
}
