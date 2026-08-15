<?php

namespace App\Actions\Portfolio;

use App\Models\Portfolio;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreatePortfolioAction
{
    public function execute(User $user, array $data): Portfolio
    {
        return DB::transaction(function () use ($user, $data): Portfolio {
            $portfolio = new Portfolio($data);
            $portfolio->user_id = $user->id;
            $portfolio->save();

            return $portfolio->load(['user', 'items']);
        });
    }
}
