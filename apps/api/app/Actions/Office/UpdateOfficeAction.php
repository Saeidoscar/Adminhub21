<?php

namespace App\Actions\Office;

use App\Models\Office;
use Illuminate\Support\Facades\DB;

class UpdateOfficeAction
{
    public function execute(Office $office, array $data): Office
    {
        return DB::transaction(function () use ($office, $data): Office {
            $office->fill($data);
            $office->save();

            return $office->load(['owner', 'members.user']);
        });
    }
}
