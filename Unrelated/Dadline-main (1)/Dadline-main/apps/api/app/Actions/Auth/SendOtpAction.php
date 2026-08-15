<?php

namespace App\Actions\Auth;

use App\Jobs\Auth\SendOtpCallJob;
use App\Jobs\Auth\SendOtpSmsJob;
use App\Services\Otp\OtpService;
use InvalidArgumentException;

class SendOtpAction
{
    public function __construct(
        private OtpService $otpService
    ) {}

    public function execute(
        string $mobile,
        ?string $channel = 'sms'
    ) {
        $channel = $channel ?? 'sms';
        if (! in_array($channel, ['sms', 'call'], true)) {
            throw new InvalidArgumentException("Invalid OTP channel: {$channel}");
        }
        $code = (string) random_int(100000, 999999);
        $otp = $this->otpService->create($mobile, $code);
        if ($channel === 'sms') {
            SendOtpSmsJob::dispatch($mobile, $code);
        }

        if ($channel === 'call') {
            SendOtpCallJob::dispatch(
                $mobile,
                $code
            );
        }

        return $otp;
    }
}
