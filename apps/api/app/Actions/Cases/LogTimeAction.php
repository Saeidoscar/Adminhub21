<?php

namespace App\Actions\Cases;

use App\Models\OfficeCase;
use App\Models\OfficeTimeLog;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LogTimeAction
{
    /**
     * @param array<string, mixed> $data
     */
    public function execute(OfficeCase $case, User $user, array $data): OfficeTimeLog
    {
        return DB::transaction(function () use ($case, $user, $data): OfficeTimeLog {
            return $case->timeLogs()->create(array_merge($data, ['user_id' => $user->id]));
        });
    }
}
