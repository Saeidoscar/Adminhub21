<?php

namespace App\Actions\Auth;

use App\Services\Otp\OtpService;


class VerifyMobileOtpAction
{

    public function __construct(
        private OtpService $otpService
    ){}


    public function execute(
        string $mobile,
        string $code
    ): bool {

        $this->otpService->verify(
            $mobile,
            $code
        );


        return true;
    }
}