<?php

namespace App\Actions\Cases;

use App\Models\OfficeCase;
use App\Models\OfficeTimeLog;
use Illuminate\Support\Facades\DB;

class UpdateTimeLogAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(OfficeTimeLog $log, array $data): OfficeTimeLog
    {
        return DB::transaction(function () use ($log, $data): OfficeTimeLog {
            $log->forceFill($data)->save();

            return $log;
        });
    }
}
