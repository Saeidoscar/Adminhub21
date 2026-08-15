<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Actions\Contracts\CancelContractAction;
use App\Actions\Contracts\CompleteContractAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\Contracts\ContractResource;
use App\Models\Contract;
use Illuminate\Http\Request;

class ContractWorkflowController extends Controller
{
    public function complete(Request $request, Contract $contract, CompleteContractAction $action): ContractResource
    {
        $this->authorize('complete', $contract);

        return new ContractResource($action->execute($contract, $request->user(), $request));
    }

    public function cancel(Request $request, Contract $contract, CancelContractAction $action): ContractResource
    {
        $this->authorize('cancel', $contract);

        return new ContractResource($action->execute($contract, $request->user(), $request));
    }
}
