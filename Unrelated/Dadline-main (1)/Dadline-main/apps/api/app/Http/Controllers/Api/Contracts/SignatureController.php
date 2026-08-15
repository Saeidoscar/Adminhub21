<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Actions\Contracts\CreateSignatureAction;
use App\Actions\Contracts\SignContractAction;
use App\Actions\Contracts\UpdateSignatureAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contracts\SignSignatureRequest;
use App\Http\Requests\Contracts\StoreSignatureRequest;
use App\Http\Requests\Contracts\UpdateSignatureRequest;
use App\Http\Resources\Contracts\SignatureResource;
use App\Models\Contract;
use App\Models\Signature;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class SignatureController extends Controller
{
    public function index(Contract $contract): AnonymousResourceCollection
    {
        $this->authorize('view', $contract);

        return SignatureResource::collection($contract->signatures()->with('user')->orderBy('id')->get());
    }

    public function store(StoreSignatureRequest $request, Contract $contract, CreateSignatureAction $action): JsonResponse
    {
        $this->authorize('manageDraft', $contract);

        $signature = $action->execute($contract, $request->validated())->load('user');

        return (new SignatureResource($signature))->response()->setStatusCode(201);
    }

    public function update(
        UpdateSignatureRequest $request,
        Contract $contract,
        Signature $signature,
        UpdateSignatureAction $action
    ): SignatureResource {
        $this->authorize('manageDraft', $contract);
        $this->ensureSignatureBelongsToContract($contract, $signature);

        return new SignatureResource($action->execute($signature, $request->validated())->load('user'));
    }

    public function destroy(Contract $contract, Signature $signature): JsonResponse
    {
        $this->authorize('manageDraft', $contract);
        $this->ensureSignatureBelongsToContract($contract, $signature);

        $signature->delete();

        return response()->json(status: 204);
    }

    public function sign(
        SignSignatureRequest $request,
        Contract $contract,
        Signature $signature,
        SignContractAction $action
    ): SignatureResource {
        $this->authorize('sign', $contract);
        $this->ensureSignatureBelongsToContract($contract, $signature);
        abort_unless(
            (int) $signature->user_id === (int) $request->user()->id || $signature->mobile === $request->user()->mobile || $request->user()->isAdmin(),
            403
        );
        $this->ensureVerifiedForSigning($request);

        return new SignatureResource($action->execute(
            signature: $signature,
            signatureId: $request->validated('signature_id'),
            metadata: $request->validated('metadata'),
            actor: $request->user(),
            request: $request
        ));
    }

    private function ensureSignatureBelongsToContract(Contract $contract, Signature $signature): void
    {
        abort_unless((int) $signature->contract_id === (int) $contract->id, 404);
    }

    private function ensureVerifiedForSigning(SignSignatureRequest $request): void
    {
        if ($request->user()->isAdmin() || $request->user()->verification?->isVerified()) {
            return;
        }

        throw ValidationException::withMessages([
            'verification' => 'برای امضای قرارداد، احراز هویت سطح ۲ الزامی است.',
        ]);
    }
}
