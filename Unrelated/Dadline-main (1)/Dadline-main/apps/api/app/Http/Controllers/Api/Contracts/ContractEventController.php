<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Actions\Contracts\RecordContractViewedAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\Contracts\ContractEventResource;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ContractEventController extends Controller
{
    public function index(Request $request, Contract $contract): AnonymousResourceCollection
    {
        $this->authorize('viewEvents', $contract);

        $events = $contract->events()
            ->with('actor')
            ->latest('occurred_at')
            ->paginate($request->integer('per_page', 50));

        return ContractEventResource::collection($events);
    }

    public function viewed(Request $request, Contract $contract, RecordContractViewedAction $action): JsonResponse
    {
        $this->authorize('view', $contract);

        $action->execute($contract, $request->user(), $request);

        return response()->json(['message' => 'Contract view recorded.']);
    }
}
