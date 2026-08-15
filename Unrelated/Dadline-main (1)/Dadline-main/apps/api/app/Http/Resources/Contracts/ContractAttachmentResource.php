<?php

namespace App\Http\Resources\Contracts;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContractAttachmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'attachmentId' => $this->attachment_id,
            'sortOrder' => $this->sort_order,
            'originalName' => $this->whenLoaded('attachment', fn () => $this->attachment?->original_name),
            'mimeType' => $this->whenLoaded('attachment', fn () => $this->attachment?->mime_type),
            'sizeBytes' => $this->whenLoaded('attachment', fn () => $this->attachment?->size_bytes),
            'url' => $this->whenLoaded('attachment', fn () => $this->attachment?->getUrl(private: true)),
            'createdAt' => $this->created_at,
        ];
    }
}
