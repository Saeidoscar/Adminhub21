<?php

namespace App\Actions\Contracts;

use App\Enums\ContractEventType;
use App\Models\Signature;
use App\Models\User;
use App\Services\Contracts\ContractEventLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class VerifySignatureOtpAction
{
    public function __construct(
        private ContractEventLogger $events
    ) {}

    public function execute(Signature $signature, string $code, ?User $actor = null, ?Request $request = null): Signature
    {
        if ($signature->verification_code !== $code || $signature->code_expires_at?->isPast() !== false) {
            throw ValidationException::withMessages([
                'verification_code' => 'کد تایید واردشده صحیح نیست یا منقضی شده است.',
            ]);
        }

        return DB::transaction(function () use ($signature, $code, $actor, $request): Signature {
            $this->events->record(
                contract: $signature->contract,
                type: ContractEventType::OtpVerified,
                actor: $actor,
                data: [
                    'signature_id' => $signature->id,
                    'mobile' => $signature->mobile,
                    'signature_code' => $signature->verification_code,
                ],
                request: $request
            );

            return $signature->refresh();
        });
    }
}
