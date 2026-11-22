<?php

namespace App\Jobs;

use App\Models\AiConversation;
use App\Models\AiMessage;
use App\Services\Ai\AiService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class ProcessAiRequest implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $timeout = 120;

    public int $backoff = 30;

    public function __construct(
        private readonly int $conversationId,
        private readonly string $prompt,
        private readonly int $userId
    ) {
        $this->onQueue('ai-default');
    }

    public function handle(AiService $aiService): void
    {
        $conversation = AiConversation::findOrFail($this->conversationId);

        $aiService->sendMessage($conversation, [
            'prompt' => $this->prompt,
        ]);
    }

    public function failed(Throwable $exception): void
    {
        Log::error('AI request job failed permanently', [
            'conversation_id' => $this->conversationId,
            'user_id' => $this->userId,
            'error' => $exception->getMessage(),
        ]);

        AiMessage::create([
            'conversation_id' => $this->conversationId,
            'prompt' => $this->prompt,
            'response' => 'An error occurred while processing your request. Please try again.',
        ]);
    }
}
