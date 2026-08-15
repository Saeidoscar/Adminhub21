<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TrackPublicViewRequest extends FormRequest
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
            'viewer_key' => ['required', 'uuid'],
        ];
    }

    public function viewerKey(): string
    {
        return (string) $this->validated('viewer_key');
    }
}
