<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PackagePlatformConfig extends Model
{
    protected $table = 'package_platform_configs';

    protected $fillable = [
        'package_id',
        'platform',
        'posts_per_month',
        'stories_per_month',
        'reels_per_month',
        'comments_per_month',
        'deliverables',
    ];

    protected function casts(): array
    {
        return [
            'package_id' => 'integer',
            'posts_per_month' => 'integer',
            'stories_per_month' => 'integer',
            'reels_per_month' => 'integer',
            'comments_per_month' => 'integer',
            'deliverables' => 'array',
        ];
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(Package::class);
    }
}
