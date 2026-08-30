<?php

namespace App\Actions\Cases;

use App\Models\OfficeCase;
use App\Models\OfficeCaseEvent;
use Illuminate\Support\Facades\DB;

class UpdateEventAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(OfficeCaseEvent $event, array $data): OfficeCaseEvent
    {
        return DB::transaction(function () use ($event, $data): OfficeCaseEvent {
            $event->forceFill($data)->save();

            return $event;
        });
    }
}
