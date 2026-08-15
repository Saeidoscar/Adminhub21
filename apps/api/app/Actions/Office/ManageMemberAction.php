<?php

namespace App\Actions\Office;

use App\Models\Office;
use App\Models\User;
use Illuminate\Support\Facades\DB;

class ManageMemberAction
{
    public function execute(Office $office, User $user, ?array $permissions = null, bool $canAccess = true): void
    {
        DB::transaction(function () use ($office, $user, $permissions, $canAccess): void {
            $office->members()->updateOrCreate(
                ['user_id' => $user->id],
                ['permissions' => $permissions ?? [], 'can_access' => $canAccess]
            );
        });
    }
}
