<?php

namespace App\Http\Resources\Tickets;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TicketDepartmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug->value,
            'label' => $this->label(),
            'isActive' => (bool) $this->is_active,
            'isDefault' => (bool) $this->is_default,
            'sortOrder' => (int) $this->sort_order,
            'supporters' => $this->whenLoaded('supporters', fn () => $this->supporters->map(fn ($user) => [
                'id' => $user->id,
                'name' => $user->full_name,
                'mobile' => $user->mobile,
                'role' => $user->role->value,
                'roleLabel' => $user->role->label(),
            ])->values()),
        ];
    }
}
