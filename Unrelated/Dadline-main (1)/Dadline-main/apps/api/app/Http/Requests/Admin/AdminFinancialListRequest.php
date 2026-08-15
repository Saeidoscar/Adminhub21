<?php

namespace App\Http\Requests\Admin;

use App\Enums\FinancialDirection;
use App\Enums\FinancialStatus;
use Illuminate\Validation\Rule;

class AdminFinancialListRequest extends AdminListRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'direction' => ['nullable', Rule::enum(FinancialDirection::class)],
            'status' => ['nullable', Rule::enum(FinancialStatus::class)],
        ];
    }
}
