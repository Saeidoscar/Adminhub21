<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Contracts\CreateContractAction;
use App\Actions\Contracts\ActivateContractAction;
use App\Actions\Contracts\CompleteContractAction;
use App\Actions\Contracts\CancelContractAction;
use App\Actions\Reviews\SubmitReviewAction;
use App\Http\Requests\Api\V1\StoreContractRequest;
use App\Http\Requests\Api\V1\StoreReviewRequest;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function __construct(
        private readonly CreateContractAction $createContract,
        private readonly ActivateContractAction $activateContract,
        private readonly CompleteContractAction $completeContract,
        private readonly CancelContractAction $cancelContract,
        private readonly SubmitReviewAction $submitReview,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $contracts = Contract::query()
            ->where('user_id', $request->user()->id)
            ->orWhere('client_id', $request->user()->id)
            ->with(['user', 'client', 'package', 'reviews'])
            ->paginate();

        return response()->json($contracts);
    }

    public function store(StoreContractRequest $request): JsonResponse
    {
        $contract = $this->createContract->execute(
            $request->user(),
            null,
            $request->validated()
        );

        return response()->json($contract, 201);
    }

    public function show(Contract $contract): JsonResponse
    {
        $contract->load(['user', 'client', 'package', 'reviews']);

        return response()->json($contract);
    }

    public function activate(Contract $contract): JsonResponse
    {
        $contract = $this->activateContract->execute($contract);

        return response()->json($contract);
    }

    public function complete(Contract $contract): JsonResponse
    {
        $contract = $this->completeContract->execute($contract);

        return response()->json($contract);
    }

    public function cancel(Contract $contract): JsonResponse
    {
        $contract = $this->cancelContract->execute($contract);

        return response()->json($contract);
    }

    public function review(StoreReviewRequest $request, Contract $contract): JsonResponse
    {
        $review = $this->submitReview->execute($request->user(), $contract, $request->validated());

        return response()->json($review, 201);
    }
}
