<?php

namespace App\Http\Requests\Content;

use App\Enums\ContentStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TransitionContentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'status' => ['required', Rule::enum(ContentStatus::class)],
            'rejection_reason' => ['nullable', 'string', 'max:5000'],
            'published_at' => ['nullable', 'date'],
        ];
    }
}
