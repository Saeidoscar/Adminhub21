<?php

namespace App\Jobs\Contracts;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Models\Contract;
use App\Services\Notifications\Data\NotificationDispatchData;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendCompletedContractSmsJob implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public int $contractId
    ) {}

    public function handle(NotificationDispatcher $notifications): void
    {
        $contract = Contract::query()->with('signatures')->find($this->contractId);

        if ($contract === null) {
            return;
        }

        foreach ($contract->signatures as $signature) {
            if ($signature->mobile === null) {
                continue;
            }

            $notifications->dispatch(new NotificationDispatchData(
                user: $signature->user,
                recipient: $signature->mobile,
                templateKey: 'contract.completed.sms',
                context: [
                    'contract_id' => $contract->id,
                    'signature_id' => $signature->id,
                    'tracking_code' => $contract->tracking_code,
                    'message' => "قرارداد شما در دادلاین تکمیل شد. کد پیگیری: {$contract->tracking_code}",
                ],
                channels: [
                    NotificationChannel::Sms,
                ],
                eventKey: 'contract.completed',
                category: NotificationCategory::Contract,
                priority: NotificationPriority::High,
                critical: true,
                dedupeKey: "contract.completed.sms:{$contract->id}:{$signature->id}:{$signature->mobile}",
            ));
        }
    }
}
