<?php

namespace App\Services\Office;

use App\Models\Office;
use App\Models\User;
use App\Actions\Office\CreateOfficeAction;
use App\Actions\Office\UpdateOfficeAction;
use App\Actions\Office\ManageMemberAction;

class OfficeService
{
    public function __construct(
        private readonly CreateOfficeAction $create,
        private readonly UpdateOfficeAction $update,
        private readonly ManageMemberAction $manageMember,
    ) {}

    public function create(User $owner, array $data): Office
    {
        return $this->create->execute($owner, $data);
    }

    public function update(Office $office, array $data): Office
    {
        return $this->update->execute($office, $data);
    }

    public function manageMember(Office $office, User $user, ?array $permissions = null, bool $canAccess = true): void
    {
        $this->manageMember->execute($office, $user, $permissions, $canAccess);
    }
}
