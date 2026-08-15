<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficeCaseEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'type' => $this->type,
            'notes' => $this->notes,
            'event_at' => $this->event_at,
            'reminder_before' => $this->reminder_before,
            'reminder_sent' => $this->reminder_sent,
            'created_at' => $this->created_at,
        ];
    }
}
