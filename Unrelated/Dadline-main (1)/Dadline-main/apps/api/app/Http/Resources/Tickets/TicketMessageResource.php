<?php

namespace App\Http\Resources\Tickets;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $ticket = $this->relationLoaded('ticket') ? $this->ticket : $this->resource->ticket;
        $actorType = match (true) {
            $this->from_admin => 'support',
            $ticket !== null && (int) $ticket->provider_id === (int) $this->user_id => 'provider',
            default => 'user',
        };

        return [
            'id' => $this->id,
            'body' => $this->body,
            'actorType' => $actorType,
            'isInternal' => (bool) $this->is_internal,
            'isMine' => (int) $request->user()?->id === (int) $this->user_id,
            'createdAt' => $this->created_at?->toISOString(),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user?->id,
                'name' => $this->user?->full_name ?: 'کاربر حذف‌شده',
                'role' => $this->user?->role?->value,
                'roleLabel' => $this->user?->role?->label(),
                'avatarUrl' => $this->user?->profile?->avatar?->getUrl(false),
            ]),
            'attachment' => $this->whenLoaded('attachment', fn () => $this->attachment === null ? null : [
                'id' => $this->attachment->id,
                'name' => $this->attachment->original_name,
                'mimeType' => $this->attachment->mime_type,
                'sizeBytes' => $this->attachment->size_bytes,
                'url' => $this->attachment->getUrl(true),
            ]),
        ];
    }
}
