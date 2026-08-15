<?php

namespace App\Actions\Contracts;

use App\Enums\ContractEventType;
use App\Enums\ContractStatus;
use App\Events\ContractActivated;
use App\Models\Contract;
use App\Models\User;
use App\Services\Contracts\ContractEventLogger;
use App\Services\Contracts\ContractSnapshotService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ActivateContractAction
{
    public function __construct(
        private ContractEventLogger $events,
        private ContractSnapshotService $snapshots
    ) {}

    /**
     * @param  array<string, mixed>  $paymentData
     */
    public function execute(
        Contract $contract,
        array $paymentData,
        ?User $actor = null,
        ?Request $request = null
    ): Contract {
        if (! $contract->isDraft()) {
            throw ValidationException::withMessages([
                'contract' => 'Only draft contracts can be activated.',
            ]);
        }

        if ($actor !== null) {
            $actor->loadMissing('verification');

            if ((int) ($actor->verification?->verified_level ?? 0) < 2 || ! $actor->verification?->isVerified()) {
                throw ValidationException::withMessages([
                    'verification' => 'برای ثبت نهایی و ارسال دعوت‌نامه قرارداد، ابتدا احراز هویت سطح ۲ را تکمیل کنید.',
                ]);
            }
        }

        $contract = DB::transaction(function () use ($contract, $paymentData, $actor, $request): Contract {
            if ($actor !== null) {
                $creatorSignature = $contract->signatures()
                    ->where('mobile', $actor->mobile)
                    ->first();

                if ($creatorSignature === null) {
                    $contract->signatures()->create([
                        'user_id' => $actor->id,
                        'full_name' => $actor->full_name,
                        'mobile' => $actor->mobile,
                        'signature_status' => 'pending',
                    ]);
                } else {
                    $creatorSignature->forceFill([
                        'user_id' => $actor->id,
                        'full_name' => $actor->full_name,
                        'mobile' => $actor->mobile,
                    ])->save();
                }
            }

            $this->events->record(
                contract: $contract,
                type: ContractEventType::PaymentCompleted,
                actor: $actor,
                data: $paymentData,
                request: $request
            );

            $contract->status = ContractStatus::Active->value;
            $contract->tracking_code ??= $this->makeTrackingCode();
            $contract->save();

            $this->snapshots->createForContract($contract, $actor, $request);

            $this->events->record(
                contract: $contract,
                type: ContractEventType::Activated,
                actor: $actor,
                data: [
                    'previous_status' => 'draft',
                    'new_status' => ContractStatus::Active->value,
                    'new_status_label' => ContractStatus::Active->label(),
                ],
                request: $request
            );

            return $contract->refresh();
        });

        ContractActivated::dispatch($contract->id);

        return $contract;
    }

    private function makeTrackingCode(): string
    {
        do {
            [$year, $month] = $this->jalaliYearMonth((int) now()->format('Y'), (int) now()->format('m'), (int) now()->format('d'));
            $numericSuffix = random_int(100, 999).substr((string) now()->timestamp, -6);
            $code = sprintf('DAD%04d%02d%s', $year, $month, $numericSuffix);
        } while (Contract::query()->where('tracking_code', $code)->exists());

        return $code;
    }

    /**
     * @return array{0: int, 1: int}
     */
    private function jalaliYearMonth(int $gregorianYear, int $gregorianMonth, int $gregorianDay): array
    {
        $gregorianDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        $jalaliDaysInMonth = [31, 31, 31, 31, 31, 31, 30, 30, 30, 30, 30, 29];
        $gy = $gregorianYear - 1600;
        $gm = $gregorianMonth - 1;
        $gd = $gregorianDay - 1;
        $gregorianDayNumber = 365 * $gy + intdiv($gy + 3, 4) - intdiv($gy + 99, 100) + intdiv($gy + 399, 400);

        for ($i = 0; $i < $gm; $i++) {
            $gregorianDayNumber += $gregorianDaysInMonth[$i];
        }

        if ($gm > 1 && (($gregorianYear % 4 === 0 && $gregorianYear % 100 !== 0) || ($gregorianYear % 400 === 0))) {
            $gregorianDayNumber++;
        }

        $jalaliDayNumber = $gregorianDayNumber + $gd - 79;
        $jalaliCycles = intdiv($jalaliDayNumber, 12053);
        $jalaliDayNumber %= 12053;
        $jy = 979 + 33 * $jalaliCycles + 4 * intdiv($jalaliDayNumber, 1461);
        $jalaliDayNumber %= 1461;

        if ($jalaliDayNumber >= 366) {
            $jy += intdiv($jalaliDayNumber - 1, 365);
            $jalaliDayNumber = ($jalaliDayNumber - 1) % 365;
        }

        for ($i = 0; $i < 11 && $jalaliDayNumber >= $jalaliDaysInMonth[$i]; $i++) {
            $jalaliDayNumber -= $jalaliDaysInMonth[$i];
        }

        return [$jy, $i + 1];
    }
}
