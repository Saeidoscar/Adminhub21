<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateOptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'value' => ['present'],
            'group' => ['sometimes', 'string', 'max:100'],
            'autoload' => ['sometimes', 'boolean'],
        ];
    }
}
