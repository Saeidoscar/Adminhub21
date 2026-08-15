<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Actions\Contracts\SendContractInvitationAction;
use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Signature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractInvitationController extends Controller
{
    public function send(Request $request, Contract $contract, SendContractInvitationAction $action): JsonResponse
    {
        $this->authorize('sendInvitations', $contract);

        $action->execute($contract->load('signatures'), actor: $request->user(), request: $request);

        return response()->json(['message' => 'Invitations queued.']);
    }

    public function resend(
        Request $request,
        Contract $contract,
        Signature $signature,
        SendContractInvitationAction $action
    ): JsonResponse {
        $this->authorize('sendInvitations', $contract);
        abort_unless((int) $signature->contract_id === (int) $contract->id, 404);

        $action->execute($contract, $signature, $request->user(), $request);

        return response()->json(['message' => 'Invitation queued.']);
    }
}
