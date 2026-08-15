<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfficeCaseResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'uuid' => $this->uuid,
            'case_number' => $this->case_number,
            'archive_number' => $this->archive_number,
            'title' => $this->title,
            'status' => $this->status,
            'case_fee' => $this->case_fee,
            'progress' => $this->progress,
            'archived_at' => $this->archived_at,
            'office' => new OfficeResource($this->whenLoaded('office')),
            'tasks' => OfficeCaseTaskResource::collection($this->whenLoaded('tasks')),
            'events' => OfficeCaseEventResource::collection($this->whenLoaded('events')),
            'notes' => OfficeCaseNoteResource::collection($this->whenLoaded('notes')),
            'time_logs' => OfficeTimeLogResource::collection($this->whenLoaded('timeLogs')),
            'transactions' => OfficeTransactionResource::collection($this->whenLoaded('transactions')),
            'attachments' => OfficeAttachmentResource::collection($this->whenLoaded('attachments')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
