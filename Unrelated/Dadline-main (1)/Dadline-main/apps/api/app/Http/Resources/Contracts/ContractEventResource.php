<?php

namespace App\Http\Resources\Contracts;

use App\Enums\ContractEventType;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->event_type,
            'typeLabel' => ContractEventType::labelFor($this->event_type),
            'actorId' => $this->actor_id,
            'actorName' => $this->whenLoaded('actor', fn () => $this->actor?->full_name),
            'eventData' => $this->event_data,
            'ipAddress' => $this->when($request->user()?->isAdmin() === true, $this->ip_address),
            'userAgent' => $this->when($request->user()?->isAdmin() === true, $this->user_agent),
            'occurredAt' => $this->occurred_at,
            'createdAt' => $this->created_at,
        ];
    }
}
