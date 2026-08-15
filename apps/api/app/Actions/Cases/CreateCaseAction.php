<?php

namespace App\Actions\Cases;

use App\Models\OfficeCase;
use App\Models\Office;
use Illuminate\Support\Facades\DB;

class CreateCaseAction
{
    public function execute(Office $office, array $data): OfficeCase
    {
        return DB::transaction(function () use ($office, $data): OfficeCase {
            $case = new OfficeCase($data);
            $case->office_id = $office->id;
            $case->save();

            return $case->load(['office', 'tasks', 'events', 'notes', 'timeLogs', 'transactions', 'attachments']);
        });
    }
}
