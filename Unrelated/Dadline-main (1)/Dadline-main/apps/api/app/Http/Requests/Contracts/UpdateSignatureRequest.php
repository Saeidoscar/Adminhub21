<?php

namespace App\Http\Requests\Contracts;

use App\Models\Signature;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class UpdateSignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'user_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'full_name' => ['sometimes', 'nullable', 'string', 'max:255'],
            'mobile' => ['sometimes', 'nullable', 'regex:/^09[0-9]{9}$/'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('mobile')) {
            $this->merge([
                'mobile' => $this->normalizeMobile((string) $this->input('mobile')),
            ]);
        }
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $mobile = $this->input('mobile');
            $contract = $this->route('contract');
            $signature = $this->route('signature');

            if (! $mobile || ! $contract) {
                return;
            }

            $exists = Signature::query()
                ->where('contract_id', $contract->id)
                ->where('mobile', $mobile)
                ->when($signature, fn ($query) => $query->whereKeyNot($signature->id))
                ->exists();

            if ($exists) {
                $validator->errors()->add('mobile', 'شماره موبایل طرفین امضا نباید در یک قرارداد تکراری باشد.');
            }
        });
    }

    private function normalizeMobile(string $mobile): string
    {
        return trim(str_replace([' ', '-'], '', strtr($mobile, [
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
        ])));
    }
}
