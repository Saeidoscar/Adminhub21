<?php

namespace App\Actions\Ai;

use App\Models\AiMessage;
use Illuminate\Support\Facades\DB;

class TrackTokensAction
{
    /**
     * @param  array<string, mixed>  $usage
     */
    public function execute(AiMessage $message, array $usage): AiMessage
    {
        return DB::transaction(function () use ($message, $usage): AiMessage {
            $message->in_tokens = $usage['in_tokens'] ?? $message->in_tokens;
            $message->out_tokens = $usage['out_tokens'] ?? $message->out_tokens;
            $message->save();

            return $message;
        });
    }
}
