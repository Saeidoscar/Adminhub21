<?php

namespace App\Http\Requests\Contracts;

use Illuminate\Foundation\Http\FormRequest;

class StoreContractAttachmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'attachment_id' => ['required', 'integer', 'exists:attachments,id'],
            'sort_order' => ['sometimes', 'integer', 'min:0'],
        ];
    }
}
