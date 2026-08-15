<?php

namespace App\Actions\Contracts;

use App\Enums\ContractEventType;
use App\Enums\ContractStatus;
use App\Jobs\Contracts\SendSignatureOtpSmsJob;
use App\Models\Signature;
use App\Models\User;
use App\Services\Contracts\ContractEventLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class SendSignatureOtpAction
{
    public function __construct(
        private ContractEventLogger $events
    ) {}

    public function execute(Signature $signature, ?User $actor = null, ?Request $request = null): Signature
    {
        if ($signature->contract->status !== ContractStatus::Active->value) {
            throw ValidationException::withMessages([
                'contract' => 'Only active contracts can be signed.',
            ]);
        }

        return DB::transaction(function () use ($signature, $actor, $request): Signature {
            $signature = Signature::query()
                ->whereKey($signature->id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($signature->verification_code !== null && $signature->code_expires_at?->isFuture()) {
                $minutes = max(1, (int) ceil(now()->diffInSeconds($signature->code_expires_at, false) / 60));

                throw ValidationException::withMessages([
                    'verification_code' => sprintf(
                        'کد تایید قبلاً برای شما ارسال شده است. لطفاً %s دقیقه دیگر دوباره تلاش کنید.',
                        $this->toPersianDigits((string) $minutes)
                    ),
                ]);
            }

            $signature->verification_code = (string) random_int(100000, 999999);
            $signature->code_expires_at = now()->addMinutes(10);
            $signature->save();

            $logContext = [
                'contract_id' => $signature->contract_id,
                'signature_id' => $signature->id,
                'mobile' => $signature->mobile,
                'expires_at' => $signature->code_expires_at?->toJSON(),
            ];

            if (app()->environment('local')) {
                $logContext['code'] = $signature->verification_code;
            }

            Log::info('Contract signature OTP SMS queued for provider delivery', $logContext);

            SendSignatureOtpSmsJob::dispatch(
                contractId: $signature->contract_id,
                signatureId: $signature->id,
                mobile: (string) $signature->mobile,
                code: $signature->verification_code,
                expiresAt: $signature->code_expires_at?->toJSON(),
            )->afterCommit();

            $this->events->record(
                contract: $signature->contract,
                type: ContractEventType::OtpSent,
                actor: $actor,
                data: [
                    'signature_id' => $signature->id,
                    'mobile' => $signature->mobile,
                    'expires_at' => $signature->code_expires_at?->toJSON(),
                ],
                request: $request
            );

            return $signature->refresh();
        });
    }

    private function toPersianDigits(string $value): string
    {
        return strtr($value, [
            '0' => '۰',
            '1' => '۱',
            '2' => '۲',
            '3' => '۳',
            '4' => '۴',
            '5' => '۵',
            '6' => '۶',
            '7' => '۷',
            '8' => '۸',
            '9' => '۹',
        ]);
    }
}
