<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class SendOtpRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mobile'  => ['required', 'string', 'regex:/^09\d{9}$/'],
            'channel' => ['nullable', 'string', 'in:sms,call'],
        ];
    }

    public function messages(): array
    {
        return [
            'mobile.regex' => 'شماره موبایل معتبر نیست.',
        ];
    }
}
