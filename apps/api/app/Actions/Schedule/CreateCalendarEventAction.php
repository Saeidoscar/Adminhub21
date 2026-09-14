<?php

namespace App\Actions\Schedule;

use App\Models\OfficeCase;
use App\Models\OfficeCaseEvent;
use Illuminate\Support\Facades\DB;

class CreateCalendarEventAction
{
    /**
     * @param array<string, mixed> $data
     */
    public function execute(OfficeCase $case, array $data): OfficeCaseEvent
    {
        return DB::transaction(function () use ($case, $data): OfficeCaseEvent {
            return $case->events()->create($data);
        });
    }
}
