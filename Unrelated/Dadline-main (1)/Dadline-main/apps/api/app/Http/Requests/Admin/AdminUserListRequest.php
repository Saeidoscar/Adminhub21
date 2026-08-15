<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserRole;
use Illuminate\Validation\Rule;

class AdminUserListRequest extends AdminListRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'role' => ['nullable', Rule::enum(UserRole::class)],
        ];
    }
}
