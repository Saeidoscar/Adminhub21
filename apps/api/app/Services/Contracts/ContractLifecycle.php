<?php

namespace App\Services\Contracts;

use App\Enums\ContractStatus;
use App\Models\Contract;

/**
 * The contract lifecycle, in one place.
 *
 * draft --sign--> pending --activate--> active --complete--> completed
 *   \_______________\_____________\_______cancel_______/
 *
 * Keeping the rules here (instead of in the controller or, worse, in the UI)
 * means the same transition cannot be judged differently by an endpoint, a job
 * or a future consumer of the API.
 */
final class ContractLifecycle
{
    public static function canSign(Contract $contract): bool
    {
        return in_array($contract->status, [
            ContractStatus::Draft->value,
            ContractStatus::Pending->value,
        ], true);
    }

    /**
     * A contract becomes active once at least one party has signed it.
     */
    public static function canActivate(Contract $contract): bool
    {
        return $contract->status === ContractStatus::Pending->value
            && $contract->signed_at !== null;
    }

    public static function canComplete(Contract $contract): bool
    {
        return $contract->status === ContractStatus::Active->value;
    }

    public static function canCancel(Contract $contract): bool
    {
        return in_array($contract->status, [
            ContractStatus::Draft->value,
            ContractStatus::Pending->value,
            ContractStatus::Active->value,
        ], true);
    }

    /**
     * Human-readable reason a transition was refused, for a 422 response.
     */
    public static function refusal(Contract $contract, string $transition): string
    {
        $status = $contract->status;

        return match ($transition) {
            'sign' => "A contract in status \"{$status}\" can no longer be signed.",
            'activate' => $contract->signed_at === null
                ? 'The contract must be signed before it can be activated.'
                : "A contract in status \"{$status}\" cannot be activated.",
            'complete' => "Only an active contract can be completed (current status: \"{$status}\").",
            'cancel' => "A contract in status \"{$status}\" cannot be cancelled.",
            default => "The transition \"{$transition}\" is not allowed for status \"{$status}\".",
        };
    }
}
