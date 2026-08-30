<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Contracts\CreateContractAction;
use App\Actions\Contracts\ActivateContractAction;
use App\Actions\Contracts\CompleteContractAction;
use App\Actions\Contracts\CancelContractAction;
use App\Actions\Contracts\UpdateContractAction;
use App\Actions\Contracts\SignContractAction;
use App\Actions\Contracts\GenerateContractPdfAction;
use App\Actions\Reviews\SubmitReviewAction;
use App\Http\Requests\Api\V1\StoreContractRequest;
use App\Http\Requests\Api\V1\StoreReviewRequest;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContractController extends Controller
{
    public function __construct(
        private readonly CreateContractAction $createContract,
        private readonly ActivateContractAction $activateContract,
        private readonly CompleteContractAction $completeContract,
        private readonly CancelContractAction $cancelContract,
        private readonly UpdateContractAction $updateContract,
        private readonly SignContractAction $signContract,
        private readonly GenerateContractPdfAction $generateContractPdf,
        private readonly SubmitReviewAction $submitReview,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $contracts = Contract::query()
            ->where('user_id', $request->user()->id)
            ->orWhere('client_id', $request->user()->id)
            ->with(['user', 'client', 'package', 'reviews', 'clauses'])
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
        $contract->load(['user', 'client', 'package', 'reviews', 'clauses']);

        return response()->json($contract);
    }

    public function update(Request $request, Contract $contract): JsonResponse
    {
        $contract = $this->updateContract->execute($contract, $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'status' => ['nullable', 'string', 'in:draft,pending,active,completed,cancelled'],
            'step_data' => ['nullable', 'array'],
            'insurance_amount' => ['nullable', 'numeric', 'min:0'],
            'substitute_provider' => ['nullable', 'string', 'max:255'],
            'milestones' => ['nullable', 'array'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date'],
        ]));

        return response()->json($contract);
    }

    public function sign(Request $request, Contract $contract): JsonResponse
    {
        $signature = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'ip_address' => ['nullable', 'ip'],
            'user_agent' => ['nullable', 'string', 'max:500'],
        ]);

        $contract = $this->signContract->execute($contract, $signature);

        return response()->json($contract);
    }

    public function generatePdf(Contract $contract): JsonResponse
    {
        $contract = $this->generateContractPdf->execute($contract);

        return response()->json(['pdf_path' => $contract->pdf_path]);
    }

    public function downloadPdf(Contract $contract): \Symfony\Component\HttpFoundation\BinaryFileResponse
    {
        if (!$contract->pdf_path || !Storage::disk('public')->exists($contract->pdf_path)) {
            abort(404, 'PDF not generated yet.');
        }

        return response()->download(storage_path('app/public/' . $contract->pdf_path));
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
