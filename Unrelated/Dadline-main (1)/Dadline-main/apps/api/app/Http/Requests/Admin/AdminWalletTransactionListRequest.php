<?php

namespace App\Http\Requests\Admin;

use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use Illuminate\Validation\Rule;

class AdminWalletTransactionListRequest extends AdminListRequest
{
    public function rules(): array
    {
        return [
            ...parent::rules(),
            'direction' => ['nullable', Rule::enum(WalletTransactionDirection::class)],
            'status' => ['nullable', Rule::enum(WalletTransactionStatus::class)],
            'type' => ['nullable', Rule::enum(WalletTransactionType::class)],
        ];
    }
}
