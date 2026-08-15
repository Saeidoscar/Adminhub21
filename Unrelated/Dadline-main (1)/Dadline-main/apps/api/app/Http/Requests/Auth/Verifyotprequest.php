<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class VerifyOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mobile' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'code'   => ['required', 'string', 'size:6'],
        ];
    }

    public function messages(): array
    {
        return [
            'mobile.regex' => 'شماره موبایل معتبر نیست.',
            'code.size'    => 'کد تایید باید 6 رقم باشد.',
        ];
    }
}
