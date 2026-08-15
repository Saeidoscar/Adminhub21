<?php

namespace App\Services\Portfolio;

use App\Models\Portfolio;
use App\Models\User;
use App\Actions\Portfolio\CreatePortfolioAction;
use App\Actions\Portfolio\AddPortfolioItemAction;
use App\Actions\Portfolio\UpdatePortfolioMediaAction;

class PortfolioService
{
    public function __construct(
        private readonly CreatePortfolioAction $create,
        private readonly AddPortfolioItemAction $addItem,
        private readonly UpdatePortfolioMediaAction $updateMedia,
    ) {}

    public function create(User $user, array $data): Portfolio
    {
        return $this->create->execute($user, $data);
    }

    public function addItem(Portfolio $portfolio, array $data): \App\Models\PortfolioItem
    {
        return $this->addItem->execute($portfolio, $data);
    }

    /**
     * @param  array<string, mixed>  $media
     */
    public function updateMedia(Portfolio $portfolio, array $media): Portfolio
    {
        return $this->updateMedia->execute($portfolio, $media);
    }
}
