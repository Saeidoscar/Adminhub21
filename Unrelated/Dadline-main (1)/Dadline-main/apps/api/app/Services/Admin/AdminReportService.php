<?php

namespace App\Services\Admin;

use App\Enums\FinancialDirection;
use App\Enums\FinancialStatus;
use App\Enums\UserRole;
use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\Financial;
use App\Models\User;
use App\Models\WalletTransaction;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;

class AdminReportService
{
    public function users(array $filters, bool $hasVendorFilter, bool $isVendor): array
    {
        $query = User::query()->with('wallet:user_id,balance,status');

        $query
            ->when($filters['q'] ?? null, function (Builder $query, string $search): void {
                $query->where(function (Builder $query) use ($search): void {
                    $query->where('mobile', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->when($filters['role'] ?? null, fn (Builder $query, string $role) => $query->where('role', $role))
            ->when($hasVendorFilter, fn (Builder $query) => $query->where('is_vendor', $isVendor))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '<=', $date));

        $paginator = $query->latest('id')->paginate((int) ($filters['per_page'] ?? 20));

        return [
            'data' => collect($paginator->items())->map(fn (User $user) => [
                'id' => $user->id,
                'fullName' => $user->full_name ?: 'بدون نام',
                'firstName' => $user->first_name,
                'lastName' => $user->last_name,
                'mobile' => $user->mobile,
                'email' => $user->email,
                'role' => $user->role->value,
                'roleLabel' => $user->role_label,
                'isVendor' => $user->is_vendor,
                'walletBalance' => (int) ($user->wallet?->balance ?? 0),
                'walletStatus' => $user->wallet?->status?->value ?? $user->wallet?->status,
                'registeredAt' => $user->registered_at?->toISOString() ?? $user->created_at?->toISOString(),
                'lastLoginAt' => $user->last_login_at?->toISOString(),
            ])->values(),
            'meta' => $this->paginationMeta($paginator),
            'filters' => [
                'roles' => UserRole::options(),
            ],
        ];
    }

    public function walletTransactions(array $filters): array
    {
        $query = WalletTransaction::query()->with([
            'user:id,first_name,last_name,mobile,email',
            'settlement:id,transaction_id,status,track_id,paid_at',
        ]);

        $query
            ->when($filters['q'] ?? null, function (Builder $query, string $search): void {
                $query->whereHas('user', function (Builder $query) use ($search): void {
                    $query->where('mobile', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('first_name', 'like', "%{$search}%")
                        ->orWhere('last_name', 'like', "%{$search}%");
                });
            })
            ->when($filters['direction'] ?? null, fn (Builder $query, string $direction) => $query->where('direction', $direction))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['type'] ?? null, fn (Builder $query, string $type) => $query->where('type', $type))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('created_at', '<=', $date));

        $summaryQuery = clone $query;
        $paginator = $query->latest('id')->paginate((int) ($filters['per_page'] ?? 20));

        return [
            'data' => collect($paginator->items())->map(fn (WalletTransaction $transaction) => [
                'id' => $transaction->id,
                'user' => [
                    'id' => $transaction->user?->id,
                    'fullName' => $transaction->user?->full_name ?: 'کاربر حذف‌شده',
                    'mobile' => $transaction->user?->mobile,
                    'email' => $transaction->user?->email,
                ],
                'amount' => (int) $transaction->amount,
                'direction' => $transaction->direction->value,
                'directionLabel' => $transaction->direction->label(),
                'type' => $transaction->type?->value,
                'typeLabel' => $transaction->typeLabel(),
                'status' => $transaction->status->value,
                'statusLabel' => $transaction->status->label(),
                'settlementStatus' => $transaction->settlement?->status?->value ?? $transaction->settlement?->status,
                'trackId' => $transaction->settlement?->track_id,
                'createdAt' => $transaction->created_at?->toISOString(),
            ])->values(),
            'summary' => [
                'count' => (clone $summaryQuery)->count(),
                'deposits' => (int) (clone $summaryQuery)
                    ->where('direction', WalletTransactionDirection::Deposit->value)
                    ->sum('amount'),
                'withdrawals' => (int) (clone $summaryQuery)
                    ->where('direction', WalletTransactionDirection::Withdrawal->value)
                    ->sum('amount'),
                'completed' => (int) (clone $summaryQuery)
                    ->where('status', WalletTransactionStatus::Completed->value)
                    ->sum('amount'),
            ],
            'meta' => $this->paginationMeta($paginator),
            'filters' => [
                'directions' => collect(WalletTransactionDirection::cases())
                    ->mapWithKeys(fn ($item) => [$item->value => $item->label()]),
                'statuses' => collect(WalletTransactionStatus::cases())
                    ->mapWithKeys(fn ($item) => [$item->value => $item->label()]),
                'types' => collect(WalletTransactionType::cases())
                    ->mapWithKeys(fn ($item) => [$item->value => $item->label()]),
            ],
        ];
    }

    public function financials(array $filters): array
    {
        $query = Financial::query()
            ->when($filters['direction'] ?? null, fn (Builder $query, string $direction) => $query->where('direction', $direction))
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['date_from'] ?? null, fn (Builder $query, string $date) => $query->whereDate('occurred_at', '>=', $date))
            ->when($filters['date_to'] ?? null, fn (Builder $query, string $date) => $query->whereDate('occurred_at', '<=', $date));

        $summaryQuery = clone $query;
        $paginator = $query->latest('occurred_at')->paginate((int) ($filters['per_page'] ?? 20));

        $income = (int) (clone $summaryQuery)
            ->where('direction', FinancialDirection::Income->value)
            ->sum('net_amount');
        $expense = (int) (clone $summaryQuery)
            ->where('direction', FinancialDirection::Expense->value)
            ->sum('net_amount');

        return [
            'data' => collect($paginator->items())->map(fn (Financial $financial) => [
                'id' => $financial->id,
                'direction' => $financial->direction->value,
                'directionLabel' => $financial->direction->label(),
                'grossAmount' => (int) $financial->gross_amount,
                'vatAmount' => (int) $financial->vat_amount,
                'netAmount' => (int) $financial->net_amount,
                'status' => $financial->status->value,
                'statusLabel' => $financial->status->label(),
                'itemId' => $financial->item_id,
                'occurredAt' => $financial->occurred_at?->toISOString(),
            ])->values(),
            'summary' => [
                'income' => $income,
                'expense' => $expense,
                'net' => $income - $expense,
                'vat' => (int) (clone $summaryQuery)->sum('vat_amount'),
            ],
            'meta' => $this->paginationMeta($paginator),
            'filters' => [
                'directions' => collect(FinancialDirection::cases())
                    ->mapWithKeys(fn ($item) => [$item->value => $item->label()]),
                'statuses' => collect(FinancialStatus::cases())
                    ->mapWithKeys(fn ($item) => [$item->value => $item->label()]),
            ],
        ];
    }

    private function paginationMeta(LengthAwarePaginator $paginator): array
    {
        return [
            'currentPage' => $paginator->currentPage(),
            'lastPage' => $paginator->lastPage(),
            'perPage' => $paginator->perPage(),
            'total' => $paginator->total(),
        ];
    }
}
