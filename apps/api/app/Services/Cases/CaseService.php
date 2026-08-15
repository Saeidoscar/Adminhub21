<?php

namespace App\Services\Cases;

use App\Models\OfficeCase;
use App\Models\Office;
use App\Models\User;
use App\Actions\Cases\CreateCaseAction;
use App\Actions\Cases\AssignTaskAction;
use App\Actions\Cases\LogTimeAction;
use App\Actions\Cases\AddEventAction;
use App\Actions\Cases\TrackProgressAction;

class CaseService
{
    public function __construct(
        private readonly CreateCaseAction $createCase,
        private readonly AssignTaskAction $assignTask,
        private readonly LogTimeAction $logTime,
        private readonly AddEventAction $addEvent,
        private readonly TrackProgressAction $trackProgress,
    ) {}

    public function createCase(Office $office, array $data): OfficeCase
    {
        return $this->createCase->execute($office, $data);
    }

    public function assignTask(OfficeCase $case, User $assignee, array $data): \App\Models\OfficeCaseTask
    {
        return $this->assignTask->execute($case, $assignee, $data);
    }

    public function logTime(OfficeCase $case, User $user, array $data): \App\Models\OfficeTimeLog
    {
        return $this->logTime->execute($case, $user, $data);
    }

    public function addEvent(OfficeCase $case, array $data): \App\Models\OfficeCaseEvent
    {
        return $this->addEvent->execute($case, $data);
    }

    public function trackProgress(OfficeCase $case, int $progress): OfficeCase
    {
        return $this->trackProgress->execute($case, $progress);
    }
}
