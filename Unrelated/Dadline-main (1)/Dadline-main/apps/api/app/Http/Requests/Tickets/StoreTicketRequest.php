<?php

namespace App\Http\Requests\Tickets;

use App\Enums\TicketPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'min:5', 'max:256'],
            'body' => ['required', 'string', 'min:10', 'max:20000'],
            'department' => [
                'sometimes',
                'nullable',
                'string',
                Rule::exists('ticket_departments', 'slug')->where('is_active', true),
            ],
            'priority' => ['sometimes', 'nullable', Rule::enum(TicketPriority::class)],
            'file' => [
                'sometimes',
                'nullable',
                'file',
                'max:10240',
                'mimes:pdf,doc,docx,xls,xlsx,jpg,jpeg,png,webp,zip,rar,txt',
            ],
        ];
    }
}
