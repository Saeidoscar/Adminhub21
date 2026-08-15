<?php

namespace App\Actions\Cases;

use App\Models\OfficeCase;
use Illuminate\Support\Facades\DB;

class TrackProgressAction
{
    public function execute(OfficeCase $case, int $progress): OfficeCase
    {
        return DB::transaction(function () use ($case, $progress): OfficeCase {
            $case->progress = $progress;
            $case->save();

            return $case;
        });
    }
}
