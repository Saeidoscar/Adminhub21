<?php

namespace App\Actions\Office;

use App\Models\Office;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class CreateOfficeAction
{
    public function execute(User $owner, array $data): Office
    {
        return DB::transaction(function () use ($owner, $data): Office {
            $office = new Office($data);
            $office->owner_id = $owner->id;
            $office->save();

            return $office->load(['owner', 'members.user']);
        });
    }
}
