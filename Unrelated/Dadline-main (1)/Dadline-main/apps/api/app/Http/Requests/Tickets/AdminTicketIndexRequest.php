<?php

namespace App\Http\Requests\Tickets;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AdminTicketIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'q' => ['sometimes', 'nullable', 'string', 'max:100'],
            'status' => ['sometimes', 'nullable', Rule::enum(TicketStatus::class)],
            'priority' => ['sometimes', 'nullable', Rule::enum(TicketPriority::class)],
            'department_id' => ['sometimes', 'nullable', 'integer', 'exists:ticket_departments,id'],
            'assigned_to_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'provider_id' => ['sometimes', 'nullable', 'integer', 'exists:users,id'],
            'page' => ['sometimes', 'integer', 'min:1'],
            'per_page' => ['sometimes', 'integer', 'min:5', 'max:100'],
        ];
    }
}
