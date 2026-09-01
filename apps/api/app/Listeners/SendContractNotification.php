<?php

namespace App\Listeners;

use App\Events\ContractSigned;
use App\Jobs\SendNotification;
use App\Models\User;
use App\Notifications\Contracts\ContractSignedNotification;

class SendContractNotification
{
    public function handle(ContractSigned $event): void
    {
        $contract = $event->contract;

        $recipients = User::whereIn('id', [
            $contract->user_id,
            $contract->client_id,
        ])->get();

        foreach ($recipients as $user) {
            SendNotification::dispatch($user, new ContractSignedNotification($contract));
        }
    }
}
