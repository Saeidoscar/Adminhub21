<?php

namespace App\Http\Requests\Content;

use Illuminate\Foundation\Http\FormRequest;

class UpsertBlogRequest extends FormRequest
{
    public function rules(): array
    {
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'title' => [$required, 'string', 'max:500'],
            'slug' => ['sometimes', 'nullable', 'string', 'max:255'],
            'excerpt' => ['sometimes', 'nullable', 'string'],
            'content' => [$required, 'string'],
            'category_slug' => ['sometimes', 'nullable', 'string', 'exists:legal_categories,slug'],
            'featured_image_id' => ['sometimes', 'nullable', 'integer', 'exists:attachments,id'],
            'tag_slugs' => ['sometimes', 'array', 'max:20'],
            'tag_slugs.*' => ['string', 'distinct', 'exists:tags,slug'],
        ];
    }
}
