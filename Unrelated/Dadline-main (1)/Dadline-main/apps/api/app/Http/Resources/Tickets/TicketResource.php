<?php

namespace App\Http\Resources\Tickets;

use App\Enums\UserRole;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'uuid' => $this->uuid,
            'title' => $this->title,
            'status' => $this->status->value,
            'statusLabel' => $this->status->label(),
            'priority' => $this->priority->value,
            'priorityLabel' => $this->priority->label(),
            'hasUnread' => $this->hasUnreadFor($request->user()),
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
            'lastMessageAt' => $this->last_message_at?->toISOString(),
            'activityAt' => $this->last_message_at?->toISOString(),
            'closedAt' => $this->closed_at?->toISOString(),
            'department' => new TicketDepartmentResource($this->whenLoaded('department')),
            'sender' => $this->whenLoaded('sender', fn () => $this->person($this->sender, $request)),
            'assignedTo' => $this->whenLoaded('assignedTo', fn () => $this->person($this->assignedTo, $request)),
            'provider' => $this->whenLoaded('provider', fn () => $this->person($this->provider, $request)),
            'lastMessage' => $this->when(
                $this->relationLoaded('latestPublicMessage') || $this->relationLoaded('latestMessage'),
                function () use ($request) {
                    $message = $this->relationLoaded('latestPublicMessage')
                        ? $this->latestPublicMessage
                        : $this->latestMessage;

                    return $message === null
                        ? null
                        : (new TicketMessageResource($message))->resolve($request);
                },
            ),
            'messages' => TicketMessageResource::collection($this->whenLoaded('messages')),
            'permissions' => [
                'canReply' => $request->user()?->can('reply', $this->resource) ?? false,
                'canChangeStatus' => $request->user()?->can('changeStatus', $this->resource) ?? false,
                'canManage' => $request->user()?->role === UserRole::ADMIN,
            ],
        ];
    }

    private function person(mixed $user, Request $request): ?array
    {
        if ($user === null) {
            return null;
        }

        return [
            'id' => $user->id,
            'name' => $user->full_name,
            'mobile' => $request->user()?->role === UserRole::ADMIN || (int) $request->user()?->id === (int) $user->id
                ? $user->mobile
                : null,
            'role' => $user->role->value,
            'roleLabel' => $user->role->label(),
            'avatarUrl' => $user->profile?->avatar?->getUrl(false),
        ];
    }
}
