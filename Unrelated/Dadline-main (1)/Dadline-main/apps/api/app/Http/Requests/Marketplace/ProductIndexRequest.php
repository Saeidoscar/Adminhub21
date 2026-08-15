<?php

namespace App\Http\Requests\Marketplace;

use App\Enums\ProductType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductIndexRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'type' => ['nullable', Rule::enum(ProductType::class)],
            'category' => ['nullable', 'string', 'max:100'],
            'vendor' => ['nullable', 'string', 'max:255'],
            'search' => ['nullable', 'string', 'max:200'],
            'sort' => ['nullable', Rule::in(['best-selling', 'price-desc', 'price-asc'])],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
        ];
    }
}
