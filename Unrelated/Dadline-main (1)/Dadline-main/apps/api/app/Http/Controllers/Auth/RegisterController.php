<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\Affiliate;
use App\Models\User;
use App\Services\Otp\OtpService;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class RegisterController extends Controller
{
    public function __construct(
        private OtpService $otpService
    ) {}

    public function register(RegisterRequest $request)
    {
        $validated = $request->validated();

        $this->ensureMobileWasVerified($validated['mobile'], $validated['otp_code']);

        $refId = $this->resolveReferrerId($validated['referral_code'] ?? null);

        $user = DB::transaction(function () use ($validated, $refId) {

            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'mobile' => $validated['mobile'],
                'password' => Hash::make($validated['password']),
                'registered_at' => now(),
                'mobile_verified_at' => now(),
                'role' => 'user',
            ]);

            if (! is_null($refId)) {
                $user->profile()->updateOrCreate(
                    [],
                    ['referrer_id' => $refId]
                );
            }

            return $user;
        });

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'ثبت‌نام با موفقیت انجام شد.',
            'user' => new UserResource($user),
            'token' => $token,
        ], 201);
    }

    /**
     * FIX: قبلاً این متد مستقیم روی مدل Otp کوئری می‌زد و منطق تایید
     * (verified_at غیر null بودن، محدوده‌ی 10 دقیقه) را این‌جا هم
     * تکرار می‌کرد، جدا از OtpService که مسئول اصلی این منطق است.
     * دو منبع حقیقت یعنی اگر یک روز قانون اعتبار OTP عوض شود
     * (مثلاً از 10 دقیقه به 5 دقیقه)، احتمال فراموش‌شدن یکی از این
     * دو جا هست. حالا این چک تماماً از طریق OtpService انجام می‌شود.
     */
    private function ensureMobileWasVerified(string $mobile, string $code): void
    {
        if (! $this->otpService->wasVerifiedRecently($mobile, $code)) {
            throw ValidationException::withMessages([
                'otp_code' => ['تایید موبایل نامعتبر یا منقضی شده است. دوباره تلاش کنید.'],
            ]);
        }
    }

    /**
     * تبدیل کد معرف وارد‌شده به شناسه‌ی کاربر معرف (ref_id)، از طریق جدول Affiliate.
     * اگر کد معرف نامعتبر بود، خطا نمی‌دهیم — فقط ref_id را خالی می‌گذاریم،
     * چون این فیلد کاملاً اختیاری است و نباید مانع ثبت‌نام شود.
     */
    private function resolveReferrerId(?string $referralCode): ?int
    {
        if (! $referralCode) {
            return null;
        }

        $marketer = Affiliate::where('referral_code', $referralCode)
            ->where('status', 'active')
            ->first();

        return $marketer?->user_id;
    }
}
