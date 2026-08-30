<?php

namespace App\Actions\Cases;

use App\Models\OfficeCaseEvent;
use Illuminate\Support\Facades\DB;

class DestroyEventAction
{
    public function execute(OfficeCaseEvent $event): void
    {
        DB::transaction(function () use ($event): void {
            $event->delete();
        });
    }
}
