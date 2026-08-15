<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;

class UpdateUserBankAccountRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'iban' => blank($this->input('iban'))
                ? null
                : strtoupper(preg_replace('/\s+/', '', $this->normalizeDigits((string) $this->input('iban')))),
        ]);
    }

    public function rules(): array
    {
        return [
            'iban' => ['required', 'regex:/^IR\d{24}$/'],
            'gateway' => ['sometimes', 'nullable', 'string', 'in:smart,sep,zibal,snapp_pay'],
            'return_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'return_context' => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }

    public function attributes(): array
    {
        return [
            'iban' => 'شماره شبا',
        ];
    }

    public function messages(): array
    {
        return [
            'iban.regex' => 'شماره شبا باید با IR شروع شود و ۲۴ رقم داشته باشد.',
        ];
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
}
