<?php

namespace App\Policies;

use App\Enums\ContractStatus;
use App\Models\Contract;
use App\Models\User;

class ContractPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function view(User $user, Contract $contract): bool
    {
        return $this->isParticipant($user, $contract);
    }

    public function update(User $user, Contract $contract): bool
    {
        return $this->owns($user, $contract)
            && $contract->status === ContractStatus::Draft->value;
    }

    public function delete(User $user, Contract $contract): bool
    {
        return (int) $contract->creator_id === (int) $user->id
            && $contract->status === ContractStatus::Draft->value;
    }

    public function manageDraft(User $user, Contract $contract): bool
    {
        return $this->update($user, $contract);
    }

    public function activate(User $user, Contract $contract): bool
    {
        return $this->owns($user, $contract)
            && $contract->status === ContractStatus::Draft->value;
    }

    public function sign(User $user, Contract $contract): bool
    {
        return $this->isParticipant($user, $contract)
            && $contract->status === ContractStatus::Active->value;
    }

    public function sendInvitations(User $user, Contract $contract): bool
    {
        return $this->owns($user, $contract)
            && $contract->status === ContractStatus::Active->value;
    }

    public function complete(User $user, Contract $contract): bool
    {
        return $this->owns($user, $contract)
            && $contract->status === ContractStatus::Active->value;
    }

    public function cancel(User $user, Contract $contract): bool
    {
        return (int) $contract->creator_id === (int) $user->id
            && $contract->status === ContractStatus::Active->value;
    }

    public function viewEvents(User $user, Contract $contract): bool
    {
        return $this->isParticipant($user, $contract);
    }

    public function downloadEvidence(User $user, Contract $contract): bool
    {
        return $this->isParticipant($user, $contract);
    }

    private function owns(User $user, Contract $contract): bool
    {
        return $user->isAdmin() || (int) $contract->creator_id === (int) $user->id;
    }

    private function isParticipant(User $user, Contract $contract): bool
    {
        if ($this->owns($user, $contract)) {
            return true;
        }

        return $contract->signatures()
            ->where(function ($query) use ($user): void {
                $query->where('user_id', $user->id)
                    ->orWhere('mobile', $user->mobile);
            })
            ->exists();
    }
}
