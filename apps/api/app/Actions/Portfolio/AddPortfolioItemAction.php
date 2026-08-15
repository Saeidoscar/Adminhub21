<?php

namespace App\Actions\Portfolio;

use App\Models\Portfolio;
use Illuminate\Support\Facades\DB;

class AddPortfolioItemAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Portfolio $portfolio, array $data): \App\Models\PortfolioItem
    {
        return DB::transaction(function () use ($portfolio, $data): \App\Models\PortfolioItem {
            return $portfolio->items()->create($data);
        });
    }
}
