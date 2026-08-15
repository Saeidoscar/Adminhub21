<?php

namespace App\Http\Requests\Content;

use App\Enums\ReactionType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ReactToContentRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'reaction' => ['required', Rule::enum(ReactionType::class)],
        ];
    }
}
