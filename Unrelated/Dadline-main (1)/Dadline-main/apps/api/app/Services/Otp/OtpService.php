<?php

namespace App\Services\Otp;

use App\Models\Otp;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class OtpService
{
    public function create(string $mobile, string $code): Otp
    {
        $recent = Otp::where('mobile', $mobile)
            ->where('created_at', '>=', now()->subSeconds(60))
            ->exists();
        if ($recent) {
            throw ValidationException::withMessages([
                'mobile' => [
                    'لطفاً کمی صبر کنید و دوباره تلاش کنید.',
                ],
            ]);
        }

        return Otp::create([
            'mobile' => $mobile,
            'code' => Hash::make($code),
            'expires_at' => now()->addMinutes(2),
        ]);
    }

    public function verify(
        string $mobile,
        string $code
    ): Otp {

        $otp = Otp::where('mobile', $mobile)
            ->whereNull('verified_at')
            ->latest('id')
            ->first();

        if (! $otp || $otp->expires_at->isPast()) {

            throw ValidationException::withMessages([
                'code' => [
                    'کد منقضی شده یا نامعتبر است.',
                ],
            ]);
        }

        if ($otp->attempts >= 5) {

            throw ValidationException::withMessages([
                'code' => [
                    'تعداد تلاش مجاز تمام شده.',
                ],
            ]);

        }

        if (! Hash::check($code, $otp->code)) {

            $otp->increment('attempts');

            throw ValidationException::withMessages([
                'code' => [
                    'کد صحیح نیست.',
                ],
            ]);
        }

        $otp->update([
            'verified_at' => now(),
        ]);

        return $otp;
    }

    public function wasVerifiedRecently(
        string $mobile,
        string $code,
        int $withinMinutes = 10
    ): bool {

        $otp = Otp::where('mobile', $mobile)
            ->whereNotNull('verified_at')
            ->where('verified_at', '>=', now()->subMinutes($withinMinutes))
            ->latest('verified_at')
            ->first();

        return $otp !== null && Hash::check($code, $otp->code);
    }
}
