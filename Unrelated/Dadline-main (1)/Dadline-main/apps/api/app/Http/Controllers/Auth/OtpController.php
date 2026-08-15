<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\SendOtpAction;
use App\Actions\Auth\VerifyOtpAction;
use App\Actions\Auth\VerifyMobileOtpAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\SendOtpRequest;
use App\Http\Requests\Auth\VerifyOtpRequest;
use App\Http\Resources\UserResource;
use Illuminate\Validation\ValidationException;


class OtpController extends Controller
{
    public function send(
        SendOtpRequest $request,
        SendOtpAction $action
    ) {

        $action->execute(
            $request->mobile,
            $request->channel ?? 'sms'
        );

        return response()->json([
            'message' => 'کد تایید ارسال شد'
        ]);
    }


    public function verify(
        VerifyOtpRequest $request,
        VerifyOtpAction $action
    ) {

        $user = $action->execute(
            $request->mobile,
            $request->code
        );


        if (!$user) {

            throw ValidationException::withMessages([
                'mobile' => [
                    'کاربری با این شماره موبایل یافت نشد.'
                ]
            ]);
        }


        if (!$user->mobile_verified_at) {

            $user->update([
                'mobile_verified_at' => now()
            ]);

        }


        $token = $user
            ->createToken('auth-token')
            ->plainTextToken;


        return response()->json([
            'message' => 'ورود موفقیت‌آمیز بود',
            'user' => new UserResource(
                $user->load('profile')
            ),
            'token' => $token,
        ]);
    }

    public function verifyForRegistration(
        VerifyOtpRequest $request,
        VerifyMobileOtpAction $action
    ) {
        $action->execute(
            $request->mobile,
            $request->code
        );

        return response()->json([
            'message' => 'شماره موبایل با موفقیت تایید شد.'
        ]);
    }
}
