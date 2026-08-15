<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'first_name'     => ['required', 'string', 'max:255'],
            'last_name'      => ['required', 'string', 'max:255'],
            'mobile'         => ['required', 'string', 'unique:users,mobile', 'regex:/^09\d{9}$/'],
            'password'       => ['required', 'string', 'min:8', 'confirmed'],
            'otp_code'       => ['required', 'string', 'size:6'],
            'referral_code'  => ['nullable', 'string', 'max:20'],
        ];
    }

    public function messages(): array
    {
        return [
            'mobile.regex'        => 'شماره موبایل معتبر نیست.',
            'mobile.unique'       => 'این شماره موبایل قبلاً ثبت شده است.',
            'password.confirmed'  => 'تکرار رمز عبور مطابقت ندارد.',
            'otp_code.required'   => 'لطفاً ابتدا شماره موبایل خود را تایید کنید.',
            'otp_code.size'       => 'کد تایید باید 6 رقم باشد.',
        ];
    }
}
