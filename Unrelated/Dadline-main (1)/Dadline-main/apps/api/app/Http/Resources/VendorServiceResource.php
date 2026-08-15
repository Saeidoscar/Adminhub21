<?php

namespace App\Http\Resources;

use App\Enums\VendorService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VendorServiceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $type = $this->service;

        return [
            'type' => $type,
            'name' => VendorService::titleOf($type),
            'price' => $this->price,
            'startingPrice' => $this->startingPrice(),
            'settings' => $this->settings,
            'sort' => $this->sort,
        ];
    }

    private function startingPrice(): ?int
    {
        $prices = data_get($this->settings, 'prices', []);
        $minimum = collect(is_array($prices) ? $prices : [])
            ->filter(fn ($price): bool => is_numeric($price) && (int) $price >= 0)
            ->map(fn ($price): int => (int) $price)
            ->min();

        if ($minimum !== null) {
            return $minimum;
        }

        return is_numeric($this->price) ? (int) $this->price : null;
    }
}
