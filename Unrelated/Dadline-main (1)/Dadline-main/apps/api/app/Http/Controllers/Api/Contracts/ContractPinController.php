<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Http\Controllers\Controller;
use App\Http\Requests\Contracts\VerifyContractPinRequest;
use App\Http\Resources\Contracts\ContractResource;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractPinController extends Controller
{
    public function refresh(Request $request, Contract $contract): ContractResource
    {
        $this->authorize('manageDraft', $contract);

        $contract->pin_code = (string) random_int(1000, 9999);
        $contract->save();

        return new ContractResource($contract->refresh());
    }

    public function verify(VerifyContractPinRequest $request, Contract $contract): JsonResponse
    {
        $this->authorize('view', $contract);

        return response()->json([
            'verified' => hash_equals((string) $contract->pin_code, (string) $request->validated('pin_code')),
        ]);
    }
}
