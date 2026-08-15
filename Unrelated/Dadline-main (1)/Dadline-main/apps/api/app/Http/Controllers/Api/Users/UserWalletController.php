<?php

namespace App\Http\Controllers\Api\Users;

use App\Enums\PaymentGateway;
use App\Enums\PayoutSettlementStatus;
use App\Enums\WalletPaymentStatus;
use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Models\GiftCard;
use App\Models\GiftCardRedemption;
use App\Models\Option;
use App\Models\PayoutSettlement;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use App\Models\WalletTransactionPayment;
use App\Services\Payments\PaymentCallbackUrl;
use App\Services\Payments\PaymentGatewayException;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\Settlements\PayoutSettlementService;
use App\Services\Wallet\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class UserWalletController extends Controller
{
    public function __construct(
        private WalletService $wallets,
        private PaymentGatewayManager $gateways,
        private PaymentCallbackUrl $callbackUrl,
        private PayoutSettlementService $settlements,
    ) {}

    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing(['profile', 'verification', 'wallet', 'subscription']);
        $wallet = $this->wallets->ensureWallet($user)->refresh();
        $perPage = min(max((int) $request->integer('per_page', 10), 5), 50);

        $baseQuery = WalletTransaction::query()
            ->with('settlement')
            ->where('user_id', $user->id)
            ->when($request->filled('direction'), fn ($query) => $query->where('direction', $request->string('direction')->toString()))
            ->when($request->filled('type'), fn ($query) => $query->where('type', $request->string('type')->toString()))
            ->when($request->filled('date_from'), fn ($query) => $query->whereDate('created_at', '>=', $request->date('date_from')))
            ->when($request->filled('date_to'), fn ($query) => $query->whereDate('created_at', '<=', $request->date('date_to')));

        $transactionsQuery = (clone $baseQuery)
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')->toString()));

        $statsQuery = (clone $baseQuery)
            ->when(
                $request->filled('status'),
                fn ($query) => $query->where('status', $request->string('status')->toString()),
                fn ($query) => $query->where('status', WalletTransactionStatus::Completed->value)
            );

        $transactions = $transactionsQuery
            ->latest()
            ->paginate($perPage);

        $settlements = PayoutSettlement::query()
            ->with('transaction')
            ->whereHas('transaction', fn ($query) => $query->where('user_id', $user->id))
            ->latest()
            ->limit(8)
            ->get();

        $giftCards = GiftCard::query()
            ->withCount('redemptions')
            ->where('user_id', $user->id)
            ->latest()
            ->limit(20)
            ->get();

        return response()->json([
            'data' => [
                'summary' => $this->summaryPayload($user, $wallet),
                'stats' => $this->statsPayload($statsQuery),
                'transactions' => $transactions->through(fn (WalletTransaction $transaction) => $this->transactionPayload($transaction)),
                'settlements' => $settlements->map(fn (PayoutSettlement $settlement) => $this->settlementPayload($settlement))->values(),
                'giftCards' => $giftCards->map(fn (GiftCard $giftCard) => $this->giftCardPayload($giftCard))->values(),
                'settlementFee' => $this->settlementFee(),
            ],
        ]);
    }

    public function withdraw(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:10000'],
        ]);

        $amount = (int) $validated['amount'];
        $settlement = $this->settlements->request(
            $request->user(),
            $amount,
            min($this->settlementFee(), $amount),
        );

        return response()->json([
            'message' => $settlement->status === PayoutSettlementStatus::Processing
                ? 'درخواست تسویه برای پرداخت آنی ثبت شد.'
                : 'درخواست تسویه ثبت شد و انتهای ماه شمسی واریز می‌شود.',
            'data' => $this->settlementPayload($settlement->load('transaction')),
        ], 201);
    }

    public function charge(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:10000'],
            'gateway' => ['sometimes', 'nullable', 'string', 'in:smart,sep,zibal,snapp_pay'],
        ]);

        $amount = (int) $validated['amount'];
        $gateway = $this->gateway($validated['gateway'] ?? null);
        $user = $request->user()->loadMissing('verification');

        if ($gateway === PaymentGateway::SnappPay) {
            if ((int) ($user->verification?->verified_level ?? 0) < 2 || ! $user->verification?->isVerified()) {
                throw ValidationException::withMessages([
                    'amount' => 'برای شارژ قسطی با اسنپ‌پی، احراز هویت سطح ۲ الزامی است.',
                ]);
            }

            if ($amount < 1000000) {
                throw ValidationException::withMessages([
                    'amount' => 'شارژ قسطی با اسنپ‌پی از ۱٬۰۰۰٬۰۰۰ تومان به بالا فعال است.',
                ]);
            }
        }

        $transaction = $this->wallets->createPendingOnlineCharge($user, $amount, [
            'purchase_type' => 'wallet_topup',
            'gateway_policy' => $gateway?->value ?? 'smart',
        ]);

        $payment = WalletTransactionPayment::query()->create([
            'transaction_id' => $transaction->id,
            'gateway' => ($gateway ?? PaymentGateway::Sep)->value,
            'amount' => $transaction->amount,
            'status' => WalletPaymentStatus::Pending,
            'request_payload' => [
                'purchase_type' => 'wallet_topup',
            ],
        ]);

        try {
            $initiation = $this->gateways->initiateSmart(
                amount: $amount,
                callbackUrl: $this->callbackUrl->forPayment($payment->id, $gateway),
                metadata: [
                    'payment_id' => $payment->id,
                    'description' => 'شارژ کیف پول دادلاین',
                    'mobile' => $user->mobile,
                    'category' => 'wallet',
                ],
                preferredGateway: $gateway
            );
        } catch (PaymentGatewayException $exception) {
            $transaction->forceFill([
                'status' => WalletTransactionStatus::Failed,
            ])->save();

            $payment->forceFill([
                'status' => WalletPaymentStatus::Failed,
                'response_payload' => [
                    'error' => $exception->getMessage(),
                ],
            ])->save();

            throw ValidationException::withMessages([
                'gateway' => 'در حال حاضر اتصال به درگاه اسنپ‌پی برقرار نشد. لطفاً کمی بعد دوباره تلاش کنید یا با پشتیبانی تماس بگیرید.',
            ]);
        }

        $payment->forceFill([
            'gateway' => $initiation->gateway,
            'gateway_token' => $initiation->token,
            'authority' => $initiation->authority,
            'ref_num' => $initiation->refNum,
            'payment_url' => $initiation->paymentUrl,
            'request_payload' => [
                'purchase_type' => 'wallet_topup',
                'gateway_response' => $initiation->payload,
            ],
        ])->save();

        return response()->json([
            'message' => 'در حال هدایت به درگاه، لطفا صبر کنید ...',
            'data' => [
                'paymentId' => $payment->id,
                'paymentUrl' => $payment->payment_url,
                'gateway' => $payment->gateway,
                'gatewayToken' => $payment->gateway_token,
            ],
        ], 201);
    }

    public function redeemGiftCard(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $code = Str::upper(Str::of($validated['code'])->trim()->replace(' ', '')->toString());

        $transaction = DB::transaction(function () use ($code, $user): WalletTransaction {
            $giftCard = GiftCard::query()
                ->where('code', $code)
                ->lockForUpdate()
                ->first();

            if (! $giftCard || ($giftCard->expires_at && $giftCard->expires_at->isPast())) {
                throw ValidationException::withMessages(['code' => 'کد هدیه معتبر نیست یا منقضی شده است.']);
            }

            if (GiftCardRedemption::query()->where('gift_card_id', $giftCard->id)->where('user_id', $user->id)->exists()) {
                throw ValidationException::withMessages(['code' => 'این کد هدیه قبلاً برای شما استفاده شده است.']);
            }

            $redeemedCount = GiftCardRedemption::query()->where('gift_card_id', $giftCard->id)->count();
            if ($redeemedCount >= $giftCard->redemption_limit) {
                throw ValidationException::withMessages(['code' => 'ظرفیت استفاده از این کارت هدیه تکمیل شده است.']);
            }

            $wallet = $this->wallets->ensureWallet($user)->refresh();
            $wallet->forceFill([
                'balance' => $wallet->balance + $giftCard->amount,
                'blocked_balance' => $wallet->blocked_balance + $giftCard->amount,
            ])->save();

            GiftCardRedemption::query()->create([
                'gift_card_id' => $giftCard->id,
                'user_id' => $user->id,
                'redeemed_at' => now(),
            ]);

            return WalletTransaction::query()->create([
                'user_id' => $user->id,
                'amount' => $giftCard->amount,
                'direction' => WalletTransactionDirection::Deposit,
                'type' => WalletTransactionType::GiftCard,
                'status' => WalletTransactionStatus::Completed,
                'payload' => ['gift_card_id' => $giftCard->id],
            ]);
        });

        return response()->json([
            'message' => 'کارت هدیه با موفقیت به کیف پول شما اضافه شد.',
            'data' => $this->transactionPayload($transaction),
        ], 201);
    }

    public function createGiftCard(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:10000'],
            'redemption_limit' => ['required', 'integer', 'min:1', 'max:100'],
            'expires_at' => ['nullable', 'date', 'after:today'],
            'code' => ['sometimes', 'nullable', 'string', 'min:4', 'max:50', 'unique:gift_cards,code'],
        ]);
        $code = $this->normalizeGiftCode($validated['code'] ?? null);

        if ($code && GiftCard::query()->where('code', $code)->exists()) {
            throw ValidationException::withMessages([
                'code' => 'این کد کارت هدیه قبلاً ثبت شده است.',
            ]);
        }

        $giftCard = DB::transaction(function () use ($code, $request, $validated): GiftCard {
            $user = $request->user();
            $totalCost = (int) $validated['amount'] * (int) $validated['redemption_limit'];
            $wallet = $this->wallets->ensureWallet($user)->refresh();

            if ($this->wallets->spendableBalance($wallet) < $totalCost) {
                throw ValidationException::withMessages([
                    'amount' => 'موجودی کیف پول کافی نیست. ابتدا کیف پول خود را شارژ کنید و سپس دوباره برای ساخت کارت هدیه اقدام کنید.',
                ]);
            }

            $this->wallets->withdrawForPurchase(
                $user,
                $totalCost,
                WalletTransactionType::GiftCard,
                ['redemption_limit' => (int) $validated['redemption_limit']]
            );

            return GiftCard::query()->create([
                'user_id' => $user->id,
                'code' => $code ?? $this->uniqueGiftCode(),
                'amount' => (int) $validated['amount'],
                'redemption_limit' => (int) $validated['redemption_limit'],
                'expires_at' => $validated['expires_at'] ?? null,
            ]);
        });

        return response()->json([
            'message' => 'کارت هدیه جدید ساخته شد.',
            'data' => [
                'id' => $giftCard->id,
                'code' => $giftCard->code,
                'amount' => (int) $giftCard->amount,
                'redemptionLimit' => (int) $giftCard->redemption_limit,
                'expiresAt' => $giftCard->expires_at?->toISOString(),
                'createdAt' => $giftCard->created_at?->toISOString(),
            ],
        ], 201);
    }

    private function summaryPayload(User $user, Wallet $wallet): array
    {
        return [
            'balance' => (int) $wallet->balance,
            'withdrawableBalance' => (int) $wallet->withdrawable_balance,
            'blockedBalance' => (int) $wallet->blocked_balance,
            'status' => $wallet->status?->value,
            'activeVerifiedLevel' => (int) ($user->verification?->verified_level ?? 0),
            'isLevelTwoVerified' => $user->verification?->isVerified() === true,
            'iban' => $user->profile?->iban,
            'bankVerified' => (bool) ($user->verification?->bank_verified ?? false),
            'hasActiveSubscription' => $user->subscription?->active() === true,
            'subscriptionPlan' => $user->subscription?->plan?->value,
            'subscriptionExpiresAt' => $user->subscription?->expires_at?->toISOString(),
        ];
    }

    private function transactionPayload(WalletTransaction $transaction): array
    {
        return [
            'id' => $transaction->id,
            'amount' => (int) $transaction->amount,
            'direction' => $transaction->direction?->value,
            'directionLabel' => $transaction->direction?->label(),
            'type' => $transaction->type?->value,
            'typeLabel' => $transaction->type?->label() ?? 'نامشخص',
            'status' => $transaction->status?->value,
            'statusLabel' => $transaction->status?->label(),
            'createdAt' => $transaction->created_at?->toISOString(),
            'settlement' => $transaction->settlement ? $this->settlementPayload($transaction->settlement) : null,
        ];
    }

    private function settlementPayload(PayoutSettlement $settlement): array
    {
        return [
            'id' => $settlement->id,
            'transactionId' => $settlement->transaction_id,
            'amount' => (int) $settlement->amount,
            'fee' => (int) $settlement->fee,
            'totalPayable' => (int) $settlement->total_payable,
            'iban' => $settlement->iban,
            'receiptLink' => $settlement->receipt_link,
            'trackId' => $settlement->track_id,
            'provider' => $settlement->provider,
            'failureReason' => $settlement->failure_reason,
            'status' => $settlement->status?->value,
            'statusLabel' => $settlement->status?->label(),
            'scheduledFor' => $settlement->scheduled_for?->toISOString(),
            'paidAt' => $settlement->paid_at?->toISOString(),
            'createdAt' => $settlement->created_at?->toISOString(),
        ];
    }

    private function giftCardPayload(GiftCard $giftCard): array
    {
        return [
            'id' => $giftCard->id,
            'code' => $giftCard->code,
            'amount' => (int) $giftCard->amount,
            'redemptionLimit' => (int) $giftCard->redemption_limit,
            'redeemedCount' => (int) ($giftCard->redemptions_count ?? 0),
            'expiresAt' => $giftCard->expires_at?->toISOString(),
            'createdAt' => $giftCard->created_at?->toISOString(),
        ];
    }

    private function settlementFee(): int
    {
        $value = Option::get('settlement_fee', 0);

        if (is_array($value)) {
            $value = $value['amount'] ?? $value['value'] ?? 0;
        }

        return max(0, (int) preg_replace('/\D+/', '', (string) $value));
    }

    private function statsPayload($query): array
    {
        $totalDeposits = (int) (clone $query)
            ->where('direction', WalletTransactionDirection::Deposit->value)
            ->sum('amount');
        $totalWithdrawals = (int) (clone $query)
            ->where('direction', WalletTransactionDirection::Withdrawal->value)
            ->sum('amount');
        $pendingAmount = (int) (clone $query)
            ->whereIn('status', [
                WalletTransactionStatus::Pending->value,
                WalletTransactionStatus::Processing->value,
            ])
            ->sum('amount');
        $completedAmount = (int) (clone $query)
            ->where('status', WalletTransactionStatus::Completed->value)
            ->sum('amount');
        $transactionCount = (int) (clone $query)->count();

        $byType = (clone $query)
            ->selectRaw("COALESCE(type, 'unknown') as type_key, SUM(amount) as total, COUNT(*) as count")
            ->groupByRaw("COALESCE(type, 'unknown')")
            ->orderByDesc('total')
            ->limit(8)
            ->get()
            ->map(fn ($row) => [
                'type' => $row->type_key === 'unknown' ? null : $row->type_key,
                'typeLabel' => WalletTransactionType::labelFor($row->type_key),
                'amount' => (int) $row->total,
                'count' => (int) $row->count,
            ])
            ->values();

        return [
            'totalDeposits' => $totalDeposits,
            'totalWithdrawals' => $totalWithdrawals,
            'netAmount' => $totalDeposits - $totalWithdrawals,
            'pendingAmount' => $pendingAmount,
            'completedAmount' => $completedAmount,
            'transactionCount' => $transactionCount,
            'byType' => $byType,
        ];
    }

    private function uniqueGiftCode(): string
    {
        do {
            $code = 'DAD' . Str::upper(Str::random(10));
        } while (GiftCard::query()->where('code', $code)->exists());

        return $code;
    }

    private function normalizeGiftCode(?string $code): ?string
    {
        if (blank($code)) {
            return null;
        }

        return Str::upper(Str::of($code)->trim()->replace(' ', '')->toString());
    }

    private function gateway(?string $gateway): ?PaymentGateway
    {
        return match ($gateway) {
            PaymentGateway::Sep->value => PaymentGateway::Sep,
            PaymentGateway::Zibal->value => PaymentGateway::Zibal,
            PaymentGateway::SnappPay->value => PaymentGateway::SnappPay,
            default => null,
        };
    }
}
