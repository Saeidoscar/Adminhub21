<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TagResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'storiesCount' => $this->whenCounted('stories'),
            'blogsCount' => $this->whenCounted('blogs'),
            $this->mergeWhen($request->is('v1/admin/*'), [
                'isActive' => $this->is_active,
                'createdAt' => $this->created_at,
                'updatedAt' => $this->updated_at,
            ]),
        ];
    }
}
