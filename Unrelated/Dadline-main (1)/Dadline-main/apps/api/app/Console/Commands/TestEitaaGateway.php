<?php

namespace App\Console\Commands;

use App\Services\Notifications\Data\ProviderSendResult;
use App\Services\Notifications\EitaaGateway;
use Illuminate\Console\Command;

class TestEitaaGateway extends Command
{
    protected $signature = 'notifications:test-eitaa
        {--validate-only : Only validate the configured EitaaYar token}
        {--chat-id= : Send to a specific Eitaa chat or channel ID}
        {--message= : Custom test message}';

    protected $description = 'Validate the configured EitaaYar token and optionally send a real test message.';

    public function handle(EitaaGateway $gateway): int
    {
        $this->components->info('Validating EitaaYar bot token...');

        $validation = $gateway->getBotInfo();

        if (! $validation->successful) {
            $this->renderFailure($validation);

            return self::FAILURE;
        }

        $botId = data_get($validation->payload, 'response.result.id');
        $botName = data_get($validation->payload, 'response.result.username')
            ?? data_get($validation->payload, 'response.result.first_name');

        $this->components->info(
            'EitaaYar token is valid'.($botName ? " for {$botName}" : '').($botId ? " [{$botId}]" : '').'.'
        );

        if ((bool) $this->option('validate-only')) {
            return self::SUCCESS;
        }

        $message = trim((string) ($this->option('message') ?: '✅ تست واقعی اتصال ایتا از سرور Dadline - '.now()->format('Y-m-d H:i:s')));
        $chatId = trim((string) $this->option('chat-id'));

        $result = $chatId !== ''
            ? $gateway->sendToBotChat($chatId, $message)
            : $gateway->sendToLegalQuestionsChannel($message);

        if (! $result->successful) {
            $this->renderFailure($result);

            return self::FAILURE;
        }

        $this->components->info(
            'Eitaa message sent successfully'.($result->messageId ? " [message_id={$result->messageId}]" : '').'.'
        );

        return self::SUCCESS;
    }

    private function renderFailure(ProviderSendResult $result): void
    {
        $this->components->error($result->errorMessage ?? 'Eitaa request failed.');
        $this->line('Provider: '.$result->provider);
        $this->line('Error code: '.($result->errorCode ?? 'unknown'));
        $this->line('Retryable: '.($result->retryable ? 'yes' : 'no'));
    }
}
