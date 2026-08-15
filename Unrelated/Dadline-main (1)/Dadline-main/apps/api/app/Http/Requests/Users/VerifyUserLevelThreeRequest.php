<?php

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;

class VerifyUserLevelThreeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'gateway' => ['sometimes', 'nullable', 'string', 'in:smart,sep,zibal'],
            'return_url' => ['sometimes', 'nullable', 'url', 'max:2048'],
            'return_context' => ['sometimes', 'nullable', 'string', 'max:100'],
        ];
    }
}
