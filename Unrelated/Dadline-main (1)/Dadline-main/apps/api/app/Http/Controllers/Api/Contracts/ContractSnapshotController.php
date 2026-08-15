<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Http\Controllers\Controller;
use App\Http\Resources\Contracts\ContractSnapshotResource;
use App\Models\Contract;

class ContractSnapshotController extends Controller
{
    public function show(Contract $contract): ContractSnapshotResource
    {
        $this->authorize('view', $contract);

        return new ContractSnapshotResource($contract->snapshot()->firstOrFail());
    }
}
