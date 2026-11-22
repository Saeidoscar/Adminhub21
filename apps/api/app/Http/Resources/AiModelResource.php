<?php

namespace App\Http\Resources;

use App\Services\Ai\AiBillingService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AiModelResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $pricing = app(AiBillingService::class)->modelPricingSummary($this->resource);

        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'code' => $this->code,
            'name' => $this->name,
            'in_usd' => $this->in_usd,
            'out_usd' => $this->out_usd,
            'in_toman_per_1m' => $pricing['in_toman_per_1m'],
            'out_toman_per_1m' => $pricing['out_toman_per_1m'],
            'estimated_turn_toman' => $pricing['estimated_turn_toman'],
            'usd_to_toman' => $pricing['usd_to_toman'],
            'markup_rate' => $pricing['markup_rate'],
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
