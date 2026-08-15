<?php

namespace App\Actions\Portfolio;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class UpdatePortfolioMediaAction
{
    /**
     * @param  array<string, mixed>  $media
     */
    public function execute(Portfolio $portfolio, array $media): Portfolio
    {
        return DB::transaction(function () use ($portfolio, $media): Portfolio {
            $portfolio->media = $media;
            $portfolio->save();

            return $portfolio;
        });
    }
}
