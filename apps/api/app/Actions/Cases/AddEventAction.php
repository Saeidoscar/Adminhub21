<?php

namespace App\Actions\Cases;

use App\Models\OfficeCase;
use Illuminate\Support\Facades\DB;

class AddEventAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(OfficeCase $case, array $data): \App\Models\OfficeCaseEvent
    {
        return DB::transaction(function () use ($case, $data): \App\Models\OfficeCaseEvent {
            return $case->events()->create($data);
        });
    }
}
