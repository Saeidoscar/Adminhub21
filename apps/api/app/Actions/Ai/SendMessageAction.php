<?php

namespace App\Actions\Ai;

use App\Models\AiConversation;
use App\Models\AiMessage;
use Illuminate\Support\Facades\DB;

class SendMessageAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(AiConversation $conversation, array $data): AiMessage
    {
        return DB::transaction(function () use ($conversation, $data): AiMessage {
            return $conversation->messages()->create($data);
        });
    }
}
