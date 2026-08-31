<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBlogRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:1', 'max:200'],
            'content' => ['required', 'string', 'min:1', 'max:10000'],
            'coverUrl' => ['nullable', 'string', 'url', 'max:500'],
            'status' => ['nullable', 'string', 'in:draft,published,archived'],
        ];
    }
}
