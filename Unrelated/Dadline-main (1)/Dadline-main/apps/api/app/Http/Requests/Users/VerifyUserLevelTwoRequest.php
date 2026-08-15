<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;

class VerifyUserLevelTwoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $birthDate = $this->input('birth_date');

        $this->merge([
            'birth_date' => blank($birthDate) ? null : str_replace('/', '-', trim($this->normalizeDigits((string) $birthDate))),
        ]);
    }

    private function normalizeDigits(string $value): string
    {
        return strtr($value, [
            '۰' => '0',
            '۱' => '1',
            '۲' => '2',
            '۳' => '3',
            '۴' => '4',
            '۵' => '5',
            '۶' => '6',
            '۷' => '7',
            '۸' => '8',
            '۹' => '9',
            '٠' => '0',
            '١' => '1',
            '٢' => '2',
            '٣' => '3',
            '٤' => '4',
            '٥' => '5',
            '٦' => '6',
            '٧' => '7',
            '٨' => '8',
            '٩' => '9',
        ]);
    }

    public function rules(): array
    {
        return [
            'birth_date' => ['required', 'regex:/^\d{4}-\d{2}-\d{2}$/'],
            'gateway' => ['sometimes', 'nullable', 'string', 'in:smart,sep,zibal,snapp_pay'],
            'return_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'return_context' => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }

    public function attributes(): array
    {
        return [
            'birth_date' => 'تاریخ تولد',
        ];
    }

    public function messages(): array
    {
        return [
            'birth_date.regex' => 'تاریخ تولد را با قالب ۱۳۷۰-۰۱-۰۱ وارد کنید.',
        ];
    }
}
