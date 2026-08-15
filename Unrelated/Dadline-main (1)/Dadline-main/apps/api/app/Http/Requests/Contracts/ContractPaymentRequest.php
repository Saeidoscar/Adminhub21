<?php

namespace App\Http\Requests\Contracts;

use Illuminate\Foundation\Http\FormRequest;

class ContractPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'amount' => ['sometimes', 'integer', 'min:0'],
            'reference_id' => ['sometimes', 'nullable', 'string', 'max:100'],
            'gateway' => ['sometimes', 'nullable', 'string', 'in:smart,sep,zibal,snapp_pay'],
            'paid_at' => ['sometimes', 'nullable', 'date'],
            'metadata' => ['sometimes', 'nullable', 'array'],
            'nationalCode' => ['sometimes', 'nullable', 'string', 'size:10'],
            'return_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'return_context' => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }
}
