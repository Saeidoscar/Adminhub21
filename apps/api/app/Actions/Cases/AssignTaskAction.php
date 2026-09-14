<?php

namespace App\Actions\Cases;

use App\Models\OfficeCase;
use App\Models\OfficeCaseTask;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class AssignTaskAction
{
    public function execute(OfficeCase $case, User $assignee, array $data): OfficeCaseTask
    {
        return DB::transaction(function () use ($case, $assignee, $data): OfficeCaseTask {
            return $case->tasks()->create(array_merge($data, ['assignee_id' => $assignee->id]));
        });
    }
}
