<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateStoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['nullable', 'string', 'min:1', 'max:200'],
            'content' => ['nullable', 'string', 'min:1', 'max:10000'],
            'coverUrl' => ['nullable', 'string', 'url', 'max:500'],
            'status' => ['nullable', 'string', 'in:draft,published,archived'],
        ];
    }
}
