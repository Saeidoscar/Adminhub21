<?php

namespace App\Services\Admin;

use App\Enums\ContractStatus;
use App\Enums\FinancialDirection;
use App\Enums\FinancialStatus;
use App\Enums\OrderStatus;
use App\Enums\PhoneConsultationStatus;
use App\Enums\ServiceRequestStatus;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Enums\VendorApplicationStatus;
use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Models\Contract;
use App\Models\ExternalServiceRequest;
use App\Models\Financial;
use App\Models\Order;
use App\Models\PhoneConsultation;
use App\Models\ServiceRequest;
use App\Models\Ticket;
use App\Models\User;
use App\Models\VendorApplication;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class AdminDashboardService
{
    public function build(): array
    {
        $now = CarbonImmutable::now();
        $today = $now->startOfDay();
        $lastThirtyDays = $now->subDays(29)->startOfDay();

        $acceptedFinancials = Financial::query()
            ->where('status', FinancialStatus::Accepted->value);

        $income = (int) (clone $acceptedFinancials)
            ->where('direction', FinancialDirection::Income->value)
            ->sum('net_amount');
        $expense = (int) (clone $acceptedFinancials)
            ->where('direction', FinancialDirection::Expense->value)
            ->sum('net_amount');

        $completedTransactions = WalletTransaction::query()
            ->where('status', WalletTransactionStatus::Completed->value);

        return [
            'generatedAt' => $now->toISOString(),
            'summary' => [
                'users' => [
                    'total' => User::query()->count(),
                    'vendors' => User::query()->where('is_vendor', true)->count(),
                    'admins' => User::query()->where('role', UserRole::ADMIN->value)->count(),
                    'today' => User::query()->where('created_at', '>=', $today)->count(),
                    'lastThirtyDays' => User::query()->where('created_at', '>=', $lastThirtyDays)->count(),
                ],
                'finance' => [
                    'income' => $income,
                    'expense' => $expense,
                    'net' => $income - $expense,
                    'walletBalance' => (int) Wallet::query()->sum('balance'),
                    'completedDeposits' => (int) (clone $completedTransactions)
                        ->where('direction', WalletTransactionDirection::Deposit->value)
                        ->sum('amount'),
                    'completedWithdrawals' => (int) (clone $completedTransactions)
                        ->where('direction', WalletTransactionDirection::Withdrawal->value)
                        ->sum('amount'),
                    'pendingWithdrawals' => (int) WalletTransaction::query()
                        ->where('direction', WalletTransactionDirection::Withdrawal->value)
                        ->whereIn('status', [
                            WalletTransactionStatus::Pending->value,
                            WalletTransactionStatus::Processing->value,
                        ])
                        ->sum('amount'),
                ],
                'operations' => $this->operationCounts(),
            ],
            'financialTrend' => $this->financialTrend($now),
            'recentUsers' => User::query()
                ->with('wallet:user_id,balance,status')
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (User $user) => $this->mapUser($user))
                ->values(),
            'recentTransactions' => WalletTransaction::query()
                ->with('user:id,first_name,last_name,mobile')
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (WalletTransaction $transaction) => $this->mapTransaction($transaction))
                ->values(),
        ];
    }

    public function operationCounts(): array
    {
        return [
            'pendingVendorApplications' => VendorApplication::query()
                ->where('status', VendorApplicationStatus::Pending->value)
                ->count(),
            'openTickets' => Ticket::query()
                ->whereIn('status', [
                    TicketStatus::Open->value,
                    TicketStatus::Pending->value,
                    TicketStatus::Referred->value,
                ])
                ->count(),
            'activeContracts' => Contract::query()
                ->where('status', ContractStatus::Active->value)
                ->count(),
            'pendingOrders' => Order::query()
                ->where('status', OrderStatus::Pending->value)
                ->count(),
            'activeServiceRequests' => ServiceRequest::query()
                ->whereIn('status', [
                    ServiceRequestStatus::Submitted->value,
                    ServiceRequestStatus::Offer->value,
                    ServiceRequestStatus::Returned->value,
                    ServiceRequestStatus::Handling->value,
                ])
                ->count(),
            'activeConsultations' => PhoneConsultation::query()
                ->whereIn('status', [
                    PhoneConsultationStatus::SUBMITTED->value,
                    PhoneConsultationStatus::CALLING->value,
                ])
                ->count(),
            'failedExternalServices' => ExternalServiceRequest::query()
                ->where('status', 'failed')
                ->where('created_at', '>=', now()->subDay())
                ->count(),
        ];
    }

    private function financialTrend(CarbonImmutable $now): array
    {
        $start = $now->subDays(13)->startOfDay();
        $rows = Financial::query()
            ->where('status', FinancialStatus::Accepted->value)
            ->where('occurred_at', '>=', $start)
            ->selectRaw('DATE(occurred_at) as date, direction, SUM(net_amount) as total')
            ->groupByRaw('DATE(occurred_at), direction')
            ->orderBy('date')
            ->toBase()
            ->get()
            ->groupBy('date');

        return collect(range(0, 13))
            ->map(function (int $offset) use ($start, $rows): array {
                $date = $start->addDays($offset)->toDateString();
                /** @var Collection<int, object> $dayRows */
                $dayRows = $rows->get($date, collect());

                return [
                    'date' => $date,
                    'income' => (int) optional(
                        $dayRows->firstWhere('direction', FinancialDirection::Income->value)
                    )->total,
                    'expense' => (int) optional(
                        $dayRows->firstWhere('direction', FinancialDirection::Expense->value)
                    )->total,
                ];
            })
            ->values()
            ->all();
    }

    private function mapUser(User $user): array
    {
        return [
            'id' => $user->id,
            'fullName' => $user->full_name ?: 'بدون نام',
            'mobile' => $user->mobile,
            'email' => $user->email,
            'role' => $user->role->value,
            'roleLabel' => $user->role_label,
            'isVendor' => $user->is_vendor,
            'walletBalance' => (int) ($user->wallet?->balance ?? 0),
            'registeredAt' => $user->registered_at?->toISOString() ?? $user->created_at?->toISOString(),
            'lastLoginAt' => $user->last_login_at?->toISOString(),
        ];
    }

    private function mapTransaction(WalletTransaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'user' => [
                'id' => $transaction->user?->id,
                'fullName' => $transaction->user?->full_name ?: 'کاربر حذف‌شده',
                'mobile' => $transaction->user?->mobile,
            ],
            'amount' => (int) $transaction->amount,
            'direction' => $transaction->direction->value,
            'directionLabel' => $transaction->direction->label(),
            'type' => $transaction->type?->value,
            'typeLabel' => $transaction->typeLabel(),
            'status' => $transaction->status->value,
            'statusLabel' => $transaction->status->label(),
            'createdAt' => $transaction->created_at?->toISOString(),
        ];
    }
}
