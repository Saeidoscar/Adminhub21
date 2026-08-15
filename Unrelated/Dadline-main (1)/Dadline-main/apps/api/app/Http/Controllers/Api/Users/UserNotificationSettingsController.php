<?php

namespace App\Http\Controllers\Api\Users;

use App\Enums\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use App\Models\Option;
use App\Models\User;
use App\Services\Notifications\SmsBalanceService;
use App\Services\Wallet\WalletService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class UserNotificationSettingsController extends Controller
{
    private const DEFAULT_FEE_PER_SMS = 1_000;

    private const SMS_PACKAGES = [
        50 => 0,
        100 => 10,
        250 => 12,
        500 => 15,
        750 => 20,
        1000 => 25,
    ];

    public function __construct(
        private readonly WalletService $wallets,
        private readonly SmsBalanceService $smsBalance
    ) {}

    public function show(Request $request): JsonResponse
    {
        $user = $request->user()->loadMissing(['notificationPreference', 'wallet']);
        $wallet = $this->wallets->ensureWallet($user)->refresh();
        $preference = $this->ensurePreference($user);

        return response()->json([
            'data' => $this->payload($user, $preference, $wallet->balance),
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'sms_enabled' => ['required', 'boolean'],
            'bot_enabled' => ['required', 'boolean'],
            'push_enabled' => ['required', 'boolean'],
            'email_enabled' => ['required', 'boolean'],
            'eitaa_enabled' => ['required', 'boolean'],
            'bale_enabled' => ['required', 'boolean'],
            'quiet_hours_start' => ['nullable', 'date_format:H:i'],
            'quiet_hours_end' => ['nullable', 'date_format:H:i'],
            'timezone' => ['nullable', 'string', 'max:64'],
        ]);

        $user = $request->user()->loadMissing('wallet');
        $preference = $this->ensurePreference($user);

        $preference->forceFill([
            'sms_enabled' => (bool) $validated['sms_enabled'],
            'bot_enabled' => (bool) $validated['bot_enabled'],
            'push_enabled' => (bool) $validated['push_enabled'],
            'email_enabled' => (bool) $validated['email_enabled'],
            'eitaa_enabled' => (bool) $validated['eitaa_enabled'],
            'bale_enabled' => (bool) $validated['bale_enabled'],
            'quiet_hours_start' => $validated['quiet_hours_start'] ?? null,
            'quiet_hours_end' => $validated['quiet_hours_end'] ?? null,
            'timezone' => $validated['timezone'] ?? 'Asia/Tehran',
        ])->save();

        return response()->json([
            'message' => 'تنظیمات اعلان‌ها ذخیره شد.',
            'data' => $this->payload(
                $user,
                $preference->refresh(),
                (int) ($this->wallets->ensureWallet($user)->balance ?? 0)
            ),
        ]);
    }

    public function buySmsPackage(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'units' => ['required', 'integer', Rule::in(array_keys(self::SMS_PACKAGES))],
        ]);

        $user = $request->user();
        $units = (int) $validated['units'];
        $package = $this->smsPackage($units, $this->feePerSms());

        $preference = DB::transaction(function () use ($package, $units, $user): NotificationPreference {
            $wallet = $this->wallets->ensureWallet($user)->refresh();

            if ($this->wallets->spendableBalance($wallet) < $package['price']) {
                throw ValidationException::withMessages([
                    'wallet' => 'موجودی کیف پول برای خرید این بسته کافی نیست. ابتدا کیف پول را شارژ کنید.',
                ]);
            }

            $this->wallets->withdrawForPurchase(
                $user,
                $package['price'],
                WalletTransactionType::SmsCharge,
                [
                    'sms_units' => $units,
                    'unit_price' => $package['unitPrice'],
                    'discount_percent' => $package['discountPercent'],
                    'original_price' => $package['originalPrice'],
                    'sms_balance_recharged' => true,
                ],
            );

            return $this->smsBalance->recharge($user, $units, true);
        });

        $wallet = $this->wallets->ensureWallet($user)->refresh();

        return response()->json([
            'message' => 'بسته پیامکی خریداری و ارسال پیامک دوباره فعال شد.',
            'data' => $this->payload($user, $preference, $wallet->balance),
        ], 201);
    }

    private function ensurePreference(User $user): NotificationPreference
    {
        return NotificationPreference::query()->firstOrCreate(
            ['user_id' => $user->id],
            [
                'sms_enabled' => true,
                'bot_enabled' => true,
                'push_enabled' => true,
                'email_enabled' => true,
                'eitaa_enabled' => true,
                'bale_enabled' => true,
                'sms_balance' => 50,
                'timezone' => 'Asia/Tehran',
            ],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(User $user, NotificationPreference $preference, int $walletBalance): array
    {
        $feePerSms = $this->feePerSms();

        return [
            'preferences' => [
                'smsEnabled' => (bool) $preference->sms_enabled,
                'botEnabled' => (bool) $preference->bot_enabled,
                'pushEnabled' => (bool) $preference->push_enabled,
                'emailEnabled' => (bool) $preference->email_enabled,
                'eitaaEnabled' => (bool) $preference->eitaa_enabled,
                'baleEnabled' => (bool) $preference->bale_enabled,
                'smsBalance' => (int) $preference->sms_balance,
                'quietHoursStart' => $preference->quiet_hours_start,
                'quietHoursEnd' => $preference->quiet_hours_end,
                'timezone' => $preference->timezone ?: 'Asia/Tehran',
            ],
            'wallet' => [
                'balance' => $walletBalance,
            ],
            'sms' => [
                'feePerSms' => $feePerSms,
                'packages' => collect(array_keys(self::SMS_PACKAGES))
                    ->map(fn (int $units) => $this->smsPackage($units, $feePerSms) + [
                        'affordable' => $walletBalance >= $this->smsPackage($units, $feePerSms)['price'],
                    ])
                    ->values(),
            ],
        ];
    }

    /**
     * @return array<string, int>
     */
    private function smsPackage(int $units, int $feePerSms): array
    {
        $discount = self::SMS_PACKAGES[$units];
        $originalPrice = $units * $feePerSms;

        return [
            'units' => $units,
            'unitPrice' => $feePerSms,
            'discountPercent' => $discount,
            'originalPrice' => $originalPrice,
            'price' => (int) round($originalPrice * (100 - $discount) / 100),
        ];
    }

    private function feePerSms(): int
    {
        $value = Option::get('fee-per-sms', self::DEFAULT_FEE_PER_SMS);

        if (is_array($value)) {
            $value = $value['amount'] ?? $value['value'] ?? $value[0] ?? self::DEFAULT_FEE_PER_SMS;
        }

        return max(1, (int) $value);
    }
}
