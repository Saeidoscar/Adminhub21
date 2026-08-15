<?php

namespace App\Actions\Schedule;

use App\Models\OfficeCaseEvent;
use Illuminate\Support\Facades\DB;

class SendReminderAction
{
    public function execute(OfficeCaseEvent $event): OfficeCaseEvent
    {
        return DB::transaction(function () use ($event): OfficeCaseEvent {
            $event->reminder_sent = true;
            $event->save();

            return $event;
        });
    }
}
