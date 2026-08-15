<?php

namespace App\Http\Requests\Contracts;

use Illuminate\Foundation\Http\FormRequest;

class SignSignatureRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'signature_id' => ['sometimes', 'nullable', 'integer', 'exists:attachments,id'],
            'metadata' => ['sometimes', 'nullable', 'array'],
        ];
    }
}
