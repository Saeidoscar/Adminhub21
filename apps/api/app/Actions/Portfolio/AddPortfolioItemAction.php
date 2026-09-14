<?php

namespace App\Actions\Portfolio;

use App\Models\Portfolio;
use App\Models\PortfolioItem;
use Illuminate\Support\Facades\DB;

class AddPortfolioItemAction
{
    /**
     * @param array<string, mixed> $data
     */
    public function execute(Portfolio $portfolio, array $data): PortfolioItem
    {
        return DB::transaction(function () use ($portfolio, $data): PortfolioItem {
            return $portfolio->items()->create($data);
        });
    }
}
