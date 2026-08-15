<?php

namespace App\Http\Requests\ShortLinks;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class CreateShortLinkRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'original_url' => [
                'required',
                'string',
                'max:2048',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if (
                        ! is_string($value)
                        || ! str_starts_with($value, '/')
                        || str_starts_with($value, '//')
                    ) {
                        $fail('آدرس باید یک مسیر داخلی معتبر باشد.');
                    }
                },
            ],
        ];
    }

    public function originalUrl(): string
    {
        return (string) $this->validated('original_url');
    }
}
