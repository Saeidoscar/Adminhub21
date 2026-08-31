<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreCommentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'postId' => ['required', 'string'],
            'postType' => ['required', 'string', 'in:story,blog'],
            'body' => ['required', 'string', 'min:1', 'max:2000'],
            'parentId' => ['nullable', 'string'],
        ];
    }
}
