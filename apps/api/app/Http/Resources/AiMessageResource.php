<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AiMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'prompt' => $this->prompt,
            'response' => $this->response,
            'in_tokens' => $this->in_tokens,
            'out_tokens' => $this->out_tokens,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
