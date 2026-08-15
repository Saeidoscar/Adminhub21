<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;

class VerifyUserLevelOneRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $nationalId = $this->input('national_id');

        $this->merge([
            'national_id' => blank($nationalId) ? null : preg_replace('/\D+/', '', $this->normalizeDigits((string) $nationalId)),
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
            'national_id' => ['required', 'digits:10'],
            'gateway' => ['sometimes', 'nullable', 'string', 'in:smart,sep,zibal,snapp_pay'],
            'return_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'return_context' => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }

    public function attributes(): array
    {
        return [
            'national_id' => 'کد ملی',
        ];
    }
}
