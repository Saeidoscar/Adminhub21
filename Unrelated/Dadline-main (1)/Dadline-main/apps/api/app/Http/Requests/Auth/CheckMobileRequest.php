<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class CheckMobileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'mobile' => ['required', 'string', 'regex:/^09\d{9}$/'],
        ];
    }

    public function messages(): array
    {
        return [
            'mobile.regex' => 'شماره موبایل معتبر نیست.',
        ];
    }
}