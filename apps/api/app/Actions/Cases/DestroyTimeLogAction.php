<?php

namespace App\Actions\Cases;

use App\Models\OfficeTimeLog;
use Illuminate\Support\Facades\DB;

class DestroyTimeLogAction
{
    public function execute(OfficeTimeLog $log): void
    {
        DB::transaction(function () use ($log): void {
            $log->delete();
        });
    }
}
