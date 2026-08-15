<?php

namespace App\Http\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ContentIndexRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'category' => ['nullable', 'string', 'max:100'],
            'tag' => ['nullable', 'string', 'max:150'],
            'search' => ['nullable', 'string', 'max:200'],
            'author' => ['nullable', 'string', 'max:150'],
            'sort' => ['nullable', Rule::in(['recent', 'views', 'likes', 'comments'])],
            'status' => ['nullable', 'string', 'max:20'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
