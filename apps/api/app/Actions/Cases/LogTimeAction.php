<?php

namespace App\Actions\Cases;

use App\Models\OfficeCase;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class LogTimeAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(OfficeCase $case, User $user, array $data): \App\Models\OfficeTimeLog
    {
        return DB::transaction(function () use ($case, $user, $data): \App\Models\OfficeTimeLog {
            return $case->timeLogs()->create(array_merge($data, ['user_id' => $user->id]));
        });
    }
}
