<?php

namespace App\Jobs\Contracts;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Models\Signature;
use App\Services\Notifications\Data\NotificationDispatchData;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendSignatureOtpSmsJob implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $contractId,
        public int $signatureId,
        public string $mobile,
        public string $code,
        public ?string $expiresAt = null,
    ) {}

    public function handle(NotificationDispatcher $notifications): void
    {
        $signature = Signature::query()
            ->with('user.botLink')
            ->find($this->signatureId);

        $notifications->dispatch(new NotificationDispatchData(
            user: $signature?->user,
            recipient: $this->mobile,
            templateKey: 'contract.signature_otp.sms',
            context: [
                'contract_id' => $this->contractId,
                'signature_id' => $this->signatureId,
                'code' => $this->code,
                'expires_at' => $this->expiresAt,
                'message' => "کد امضای قرارداد دادلاین: {$this->code}",
            ],
            channels: [
                NotificationChannel::Sms,
                NotificationChannel::Bale,
            ],
            eventKey: 'contract.signature_otp.requested',
            category: NotificationCategory::Contract,
            priority: NotificationPriority::Critical,
            critical: true,
            dedupeKey: "contract.signature_otp.sms:{$this->contractId}:{$this->signatureId}:{$this->mobile}:{$this->code}",
        ));
    }
}
