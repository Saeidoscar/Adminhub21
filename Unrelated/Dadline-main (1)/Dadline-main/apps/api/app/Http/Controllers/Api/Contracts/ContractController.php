<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Actions\Contracts\CreateContractAction;
use App\Actions\Contracts\DeleteDraftContractAction;
use App\Actions\Contracts\UpdateDraftContractAction;
use App\Enums\ContractEventType;
use App\Enums\ContractStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contracts\ContractIndexRequest;
use App\Http\Requests\Contracts\StoreContractRequest;
use App\Http\Requests\Contracts\UpdateContractRequest;
use App\Http\Resources\Contracts\ContractResource;
use App\Models\Contract;
use App\Models\Signature;
use App\Services\Contracts\ContractEventLogger;
use App\Services\Contracts\ContractQrCodeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ContractController extends Controller
{
    public function index(ContractIndexRequest $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Contract::class);

        $contracts = Contract::query()
            ->when(! $request->user()->isAdmin(), fn ($query) => $query->where(function ($query) use ($request): void {
                $query->where('creator_id', $request->user()->id)
                    ->orWhereHas('signatures', function ($query) use ($request): void {
                        $query->where('user_id', $request->user()->id)
                            ->orWhere('mobile', $request->user()->mobile);
                    });
            }))
            ->when($request->validated('status'), fn ($query, string $status) => $query->where('status', $status))
            ->when($request->validated('q'), function ($query, string $q): void {
                $query->where(function ($query) use ($q): void {
                    $query->where('title', 'like', "%{$q}%")
                        ->orWhere('tracking_code', $q)
                        ->when(Str::isUuid($q), fn ($query) => $query->orWhere('uuid', $q))
                        ->orWhereHas('signatures', function ($query) use ($q): void {
                            $query->where('full_name', 'like', "%{$q}%")
                                ->orWhere('mobile', 'like', "%{$q}%");
                        });
                });
            })
            ->when($request->validated('date_from'), fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($request->validated('date_to'), fn ($query, string $date) => $query->whereDate('created_at', '<=', $date))
            ->with(['creator', 'qr', 'attachments.attachment', 'signatures'])
            ->latest('updated_at')
            ->paginate($request->integer('per_page', 20));

        return ContractResource::collection($contracts);
    }

    public function store(StoreContractRequest $request, CreateContractAction $action): JsonResponse
    {
        $this->authorize('create', Contract::class);

        $contract = $action->execute($request->user(), $request->validated())
            ->load(['creator', 'qr', 'attachments.attachment', 'signatures']);

        return (new ContractResource($contract))->response()->setStatusCode(201);
    }

    public function show(
        Request $request,
        Contract $contract,
        ContractEventLogger $events,
        ContractQrCodeService $qrCodes
    ): ContractResource {
        $this->authorize('view', $contract);
        $signature = $this->invitedViewerSignature($request, $contract);

        $this->ensureInvitedViewerIsVerified($request, $contract, $signature);
        $this->recordInvitedViewerAccess($request, $contract, $events, $signature);

        if ($contract->status === ContractStatus::Completed->value && $contract->qr_id === null) {
            $qrCodes->ensureForContract($contract);
        }

        return new ContractResource($contract->load([
            'creator',
            'qr',
            'attachments.attachment',
            'signatures.signatureFile',
            'signatures.user.profile',
            'snapshot',
            'aiAnalysis',
        ]));
    }

    public function update(UpdateContractRequest $request, Contract $contract, UpdateDraftContractAction $action): ContractResource
    {
        $this->authorize('update', $contract);

        $draftData = $request->safe()->except('pin_code');

        if ($draftData !== []) {
            $contract = $action->execute($contract, $draftData, $request->user(), $request);
        }

        if ($request->has('pin_code')) {
            $contract->pin_code = $request->validated('pin_code');
            $contract->save();
        }

        return new ContractResource($contract->load(['creator', 'qr', 'attachments.attachment', 'signatures']));
    }

    public function destroy(Contract $contract, DeleteDraftContractAction $action): JsonResponse
    {
        $this->authorize('delete', $contract);

        $action->execute($contract);

        return response()->json(status: 204);
    }

    private function ensureInvitedViewerIsVerified(Request $request, Contract $contract, ?Signature $signature): void
    {
        if (
            $request->user()->isAdmin()
            || (int) $contract->creator_id === (int) $request->user()->id
            || $signature === null
            || $request->user()->verification?->isVerified() === true
        ) {
            return;
        }

        throw ValidationException::withMessages([
            'verification' => 'برای ورود و مشاهده قرارداد، ابتدا احراز هویت سطح ۲ را تکمیل کنید.',
        ]);
    }

    private function recordInvitedViewerAccess(Request $request, Contract $contract, ContractEventLogger $events, ?Signature $signature): void
    {
        if ($request->user()->isAdmin() || (int) $contract->creator_id === (int) $request->user()->id) {
            return;
        }

        if ($signature === null) {
            return;
        }

        $fullName = trim($request->user()->first_name.' '.$request->user()->last_name);
        $signatureChanges = [];

        if ($signature->user_id === null) {
            $signatureChanges['user_id'] = $request->user()->id;
        }

        if ($fullName !== '' && $signature->full_name !== $fullName) {
            $signatureChanges['full_name'] = $fullName;
        }

        if ($signatureChanges !== []) {
            $signature->forceFill($signatureChanges)->save();
        }

        $alreadyViewed = $contract->events()
            ->where('actor_id', $request->user()->id)
            ->where('event_type', ContractEventType::Viewed->value)
            ->where('event_data->signature_id', $signature->id)
            ->exists();

        if ($alreadyViewed) {
            return;
        }

        $events->record(
            contract: $contract,
            type: ContractEventType::Viewed,
            actor: $request->user(),
            data: [
                'signature_id' => $signature->id,
                'mobile' => $signature->mobile,
                'full_name' => $fullName !== '' ? $fullName : $signature->full_name,
                'message' => 'کاربر دعوت‌شده وارد قرارداد شد.',
            ],
            request: $request
        );
    }

    private function invitedViewerSignature(Request $request, Contract $contract): ?Signature
    {
        if ($request->user()->isAdmin() || (int) $contract->creator_id === (int) $request->user()->id) {
            return null;
        }

        return $contract->signatures()
            ->where(function ($query) use ($request): void {
                $query->where('user_id', $request->user()->id)
                    ->orWhere('mobile', $request->user()->mobile);
            })
            ->first();
    }
}
