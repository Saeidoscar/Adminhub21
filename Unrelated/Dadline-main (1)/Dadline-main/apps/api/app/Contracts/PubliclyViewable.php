<?php

namespace App\Contracts;

use Illuminate\Database\Eloquent\Builder;

interface PubliclyViewable
{
    public function scopePublished(Builder $query): Builder;

    public function viewCacheNamespace(): string;
}
