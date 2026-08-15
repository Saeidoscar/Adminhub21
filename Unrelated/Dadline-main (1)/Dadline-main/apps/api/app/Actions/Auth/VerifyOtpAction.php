<?php

namespace App\Actions\Auth;


use App\Services\Otp\OtpService;
use App\Models\User;


class VerifyOtpAction
{


    public function __construct(
        private OtpService $otpService
    ){}

    public function execute(
        string $mobile,
        string $code
    ) {
        $this->otpService->verify(
            $mobile,
            $code
        );

        return User::where('mobile', $mobile)->first();
    }

}
