<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Actions\Contracts\SendSignatureOtpAction;
use App\Actions\Contracts\VerifySignatureOtpAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contracts\VerifySignatureOtpRequest;
use App\Http\Resources\Contracts\SignatureResource;
use App\Models\Contract;
use App\Models\Signature;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class SignatureOtpController extends Controller
{
    public function send(Request $request, Contract $contract, Signature $signature, SendSignatureOtpAction $action): SignatureResource
    {
        $this->authorize('sign', $contract);
        $this->ensureSignatureBelongsToContract($contract, $signature);
        $this->ensureSignatureBelongsToUser($request, $signature);
        $this->ensureVerifiedForSigning($request);

        return new SignatureResource($action->execute($signature, $request->user(), $request));
    }

    public function verify(
        VerifySignatureOtpRequest $request,
        Contract $contract,
        Signature $signature,
        VerifySignatureOtpAction $action
    ): SignatureResource {
        $this->authorize('sign', $contract);
        $this->ensureSignatureBelongsToContract($contract, $signature);
        $this->ensureSignatureBelongsToUser($request, $signature);
        $this->ensureVerifiedForSigning($request);

        return new SignatureResource($action->execute(
            $signature,
            $request->validated('verification_code'),
            $request->user(),
            $request
        ));
    }

    private function ensureSignatureBelongsToContract(Contract $contract, Signature $signature): void
    {
        abort_unless((int) $signature->contract_id === (int) $contract->id, 404);
    }

    private function ensureSignatureBelongsToUser(Request $request, Signature $signature): void
    {
        abort_unless(
            (int) $signature->user_id === (int) $request->user()->id
                || $signature->mobile === $request->user()->mobile
                || $request->user()->isAdmin(),
            403
        );
    }

    private function ensureVerifiedForSigning(Request $request): void
    {
        if ($request->user()->isAdmin() || $request->user()->verification?->isVerified()) {
            return;
        }

        throw ValidationException::withMessages([
            'verification' => 'برای دریافت کد تایید و امضای قرارداد، احراز هویت سطح ۲ الزامی است.',
        ]);
    }
}
