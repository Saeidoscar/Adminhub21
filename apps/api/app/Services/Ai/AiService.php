<?php

namespace App\Services\Ai;

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Models\User;
use App\Actions\Ai\CreateConversationAction;
use App\Actions\Ai\SendMessageAction;
use App\Actions\Ai\TrackTokensAction;
use App\Actions\Ai\ManageModelsAction;

class AiService
{
    public function __construct(
        private readonly CreateConversationAction $createConversation,
        private readonly SendMessageAction $sendMessage,
        private readonly TrackTokensAction $trackTokens,
        private readonly ManageModelsAction $manageModels,
    ) {}

    public function createConversation(User $user, array $data): AiConversation
    {
        return $this->createConversation->execute($user, $data);
    }

    public function sendMessage(AiConversation $conversation, array $data): AiMessage
    {
        return $this->sendMessage->execute($conversation, $data);
    }

    /**
     * @param  array<string, mixed>  $usage
     */
    public function trackTokens(AiMessage $message, array $usage): AiMessage
    {
        return $this->trackTokens->execute($message, $usage);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function manageModel(?object $model, array $data): \App\Models\AiModel
    {
        return $this->manageModels->execute($model, $data);
    }
}
