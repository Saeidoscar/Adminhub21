<?php

namespace App\Console\Commands;

use App\Services\Notifications\BaleGateway;
use App\Services\Notifications\Data\ProviderSendResult;
use Illuminate\Console\Command;

class TestBaleGateway extends Command
{
    protected $signature = 'notifications:test-bale
        {--validate-only : Only validate the configured Bale bot token}
        {--chat-id= : Send to a specific Bale chat or channel ID}
        {--phone= : Send through Bale Safir to an Iranian mobile number}
        {--otp= : Send a numeric OTP through Bale Safir}
        {--message= : Custom test message}';

    protected $description = 'Validate the Bale bot token and optionally send a real bot or Safir test message.';

    public function handle(BaleGateway $gateway): int
    {
        $phone = trim((string) $this->option('phone'));
        $otp = trim((string) $this->option('otp'));

        if ($phone !== '') {
            return $this->testSafir($gateway, $phone, $otp);
        }

        $this->components->info('Validating Bale bot token...');

        $validation = $gateway->getBotInfo();

        if (! $validation->successful) {
            $this->renderFailure($validation);

            return self::FAILURE;
        }

        $botId = data_get($validation->payload, 'response.result.id');
        $botName = data_get($validation->payload, 'response.result.username')
            ?? data_get($validation->payload, 'response.result.first_name');

        $this->components->info(
            'Bale bot token is valid'.($botName ? " for {$botName}" : '').($botId ? " [{$botId}]" : '').'.'
        );

        if ((bool) $this->option('validate-only')) {
            return self::SUCCESS;
        }

        $message = trim((string) ($this->option('message') ?: '✅ تست واقعی اتصال بله از سرور Dadline - '.now()->format('Y-m-d H:i:s')));
        $chatId = trim((string) $this->option('chat-id'));

        $result = $chatId !== ''
            ? $gateway->sendToChat($chatId, $message)
            : $gateway->sendToLegalQuestionsChannel($message);

        if (! $result->successful) {
            $this->renderFailure($result);

            return self::FAILURE;
        }

        $this->components->info(
            'Bale message sent successfully'.($result->messageId ? " [message_id={$result->messageId}]" : '').'.'
        );

        return self::SUCCESS;
    }

    private function testSafir(BaleGateway $gateway, string $phone, string $otp): int
    {
        $result = $otp !== ''
            ? $gateway->sendOtpToPhone($phone, $otp, 'bale-cli-'.now()->timestamp)
            : $gateway->sendToPhone(
                $phone,
                trim((string) ($this->option('message') ?: '✅ تست واقعی سرویس سفیر بله از Dadline')),
                'bale-cli-'.now()->timestamp,
            );

        if (! $result->successful) {
            $this->renderFailure($result);

            return self::FAILURE;
        }

        $this->components->info(
            'Bale Safir message sent successfully'.($result->messageId ? " [message_id={$result->messageId}]" : '').'.'
        );

        return self::SUCCESS;
    }

    private function renderFailure(ProviderSendResult $result): void
    {
        $this->components->error($result->errorMessage ?? 'Bale request failed.');
        $this->line('Provider: '.$result->provider);
        $this->line('Error code: '.($result->errorCode ?? 'unknown'));
        $this->line('Retryable: '.($result->retryable ? 'yes' : 'no'));
    }
}
