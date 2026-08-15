<?php

namespace App\Jobs\Contracts;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Services\Notifications\Data\NotificationDispatchData;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendContractInvitationSmsJob implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $contractId,
        public int $signatureId,
        public string $mobile,
    ) {}

    public function handle(NotificationDispatcher $notifications): void
    {
        $notifications->dispatch(new NotificationDispatchData(
            user: null,
            recipient: $this->mobile,
            templateKey: 'contract.invitation.sms',
            context: [
                'contract_id' => $this->contractId,
                'signature_id' => $this->signatureId,
                'mobile' => $this->mobile,
                'message' => 'برای امضای قرارداد در دادلاین دعوت شده‌اید.',
            ],
            channels: [
                NotificationChannel::Sms,
            ],
            eventKey: 'contract.invitation.sent',
            category: NotificationCategory::Contract,
            priority: NotificationPriority::High,
            critical: true,
            dedupeKey: "contract.invitation.sms:{$this->contractId}:{$this->signatureId}:{$this->mobile}",
        ));
    }
}
