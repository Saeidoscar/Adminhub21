<?php

namespace App\Services\Schedule;

use App\Models\OfficeCase;
use App\Models\OfficeCaseEvent;
use App\Models\OfficeCaseTask;
use App\Actions\Schedule\CreateCalendarEventAction;
use App\Actions\Schedule\SendReminderAction;
use App\Actions\Schedule\ManageTaskQueueAction;

class ScheduleService
{
    public function __construct(
        private readonly CreateCalendarEventAction $createEvent,
        private readonly SendReminderAction $sendReminder,
        private readonly ManageTaskQueueAction $manageTask,
    ) {}

    public function createCalendarEvent(OfficeCase $case, array $data): OfficeCaseEvent
    {
        return $this->createEvent->execute($case, $data);
    }

    public function sendReminder(OfficeCaseEvent $event): OfficeCaseEvent
    {
        return $this->sendReminder->execute($event);
    }

    public function manageTaskQueue(OfficeCaseTask $task, string $status): OfficeCaseTask
    {
        return $this->manageTask->execute($task, $status);
    }
}
