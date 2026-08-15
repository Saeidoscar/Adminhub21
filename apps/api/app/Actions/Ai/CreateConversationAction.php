<?php

namespace App\Actions\Ai;

use App\Models\AiConversation;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateConversationAction
{
    public function execute(User $user, array $data): AiConversation
    {
        return DB::transaction(function () use ($user, $data): AiConversation {
            $conversation = new AiConversation($data);
            $conversation->user_id = $user->id;
            $conversation->save();

            return $conversation->load(['user', 'model', 'messages']);
        });
    }
}
