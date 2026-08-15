<?php

namespace App\Actions\Schedule;

use App\Models\OfficeCaseTask;
use Illuminate\Support\Facades\DB;

class ManageTaskQueueAction
{
    public function execute(OfficeCaseTask $task, string $status): OfficeCaseTask
    {
        return DB::transaction(function () use ($task, $status): OfficeCaseTask {
            $task->status = $status;
            $task->save();

            return $task;
        });
    }
}
