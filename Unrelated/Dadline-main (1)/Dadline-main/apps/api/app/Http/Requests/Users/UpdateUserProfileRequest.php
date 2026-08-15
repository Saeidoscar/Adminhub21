<?php

namespace App\Http\Requests\Users;

use App\Support\PersianTextNormalizer;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $nationalId = $this->input('national_id');

        $this->merge([
            'first_name' => PersianTextNormalizer::normalizeName((string) $this->input('first_name', '')),
            'last_name' => PersianTextNormalizer::normalizeName((string) $this->input('last_name', '')),
            'email' => blank($this->input('email')) ? null : trim((string) $this->input('email')),
            'national_id' => blank($nationalId) ? null : preg_replace('/\D+/', '', $this->normalizeDigits((string) $nationalId)),
            'birth_date' => blank($this->input('birth_date')) ? null : str_replace('/', '-', trim($this->normalizeDigits((string) $this->input('birth_date')))),
            'city_id' => blank($this->input('city_id')) ? null : $this->input('city_id'),
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
        $userId = $this->user()?->id;

        return [
            'first_name' => ['required', 'string', 'max:80'],
            'last_name' => ['required', 'string', 'max:80'],
            'email' => [
                'nullable',
                'email:rfc',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'national_id' => ['nullable', 'digits:10'],
            'birth_date' => ['nullable', 'regex:/^\d{4}-\d{2}-\d{2}$/'],
            'city_id' => ['nullable', 'integer', Rule::exists('cities', 'id')],
        ];
    }

    public function attributes(): array
    {
        return [
            'first_name' => 'نام',
            'last_name' => 'نام خانوادگی',
            'email' => 'ایمیل',
            'national_id' => 'کد ملی',
            'birth_date' => 'تاریخ تولد',
            'city_id' => 'شهر',
        ];
    }

    public function messages(): array
    {
        return [
            'birth_date.regex' => 'تاریخ تولد را با قالب ۱۳۷۰-۰۱-۰۱ وارد کنید.',
        ];
    }
}
