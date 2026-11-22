<?php

namespace App\Services\Ai;

use App\Enums\WalletTransactionType;
use App\Models\AiMessage;
use App\Models\AiModel;
use App\Models\User;
use App\Services\Wallet\WalletService;
use Illuminate\Validation\ValidationException;

class AiBillingService
{
    public const SOURCE_FREE_ALLOWANCE = 'free_allowance';

    public const SOURCE_WALLET = 'wallet';

    public function __construct(
        private readonly WalletService $walletService,
    ) {}

    public function usdToToman(): int
    {
        return max(1, (int) config('ai.usd_to_toman', 270000));
    }

    public function markupRate(): float
    {
        return max(0.0, (float) config('ai.markup_rate', 0.40));
    }

    public function calculateRawUsd(float $inUsdPer1M, float $outUsdPer1M, int $inTokens, int $outTokens): float
    {
        $inTokens = max(0, $inTokens);
        $outTokens = max(0, $outTokens);

        return ($inTokens * $inUsdPer1M + $outTokens * $outUsdPer1M) / 1_000_000;
    }

    public function calculateChargeToman(float $inUsdPer1M, float $outUsdPer1M, int $inTokens, int $outTokens): int
    {
        if (($inTokens + $outTokens) <= 0) {
            return 0;
        }

        $rawUsd = $this->calculateRawUsd($inUsdPer1M, $outUsdPer1M, $inTokens, $outTokens);
        if ($rawUsd <= 0.0) {
            return 0;
        }

        $charged = (int) ceil($rawUsd * $this->usdToToman() * (1.0 + $this->markupRate()));
        $minimum = max(0, (int) config('ai.minimum_charge_toman', 1));

        return max($minimum, $charged);
    }

    /**
     * Conservative token estimate for Persian/English messages before calling
     * an upstream model so `authorize()` safely covers output ceilings.
     *
     * @param array<int, array<string, mixed>> $messages
     */
    public function estimatePromptTokens(array $messages): int
    {
        $total = 0;

        foreach ($messages as $message) {
            $content = (string) ($message['content'] ?? '');
            $chars = mb_strlen($content, 'UTF-8');
            $total += (int) ceil($chars / 2.0) + 16;
        }

        return max(16, $total);
    }

    public function freeTokensUsedToday(User $user): int
    {
        return (int) AiMessage::query()
            ->whereHas('conversation', static function ($query) use ($user): void {
                $query->where('user_id', $user->id);
            })
            ->where('billing_source', self::SOURCE_FREE_ALLOWANCE)
            ->where('created_at', '>=', now()->startOfDay())
            ->selectRaw('COALESCE(SUM(COALESCE(in_tokens, 0) + COALESCE(out_tokens, 0)), 0) as total_tokens')
            ->value('total_tokens');
    }

    public function isEligibleForFreeAllowance(User $user, string $task, ?AiModel $model): bool
    {
        if (! (bool) config('ai.free_allowance.enabled', true)) {
            return false;
        }

        $allowedTasks = (array) config('ai.free_allowance.allowed_tasks', []);
        if (! in_array($task, $allowedTasks, true)) {
            return false;
        }

        $allowedModels = (array) config('ai.free_allowance.allowed_models', []);
        if ($model === null || ! in_array($model->code, $allowedModels, true)) {
            return false;
        }

        $dailyLimit = max(0, (int) config('ai.free_allowance.daily_tokens', 25000));
        if ($dailyLimit <= 0) {
            return false;
        }

        return $this->freeTokensUsedToday($user) < $dailyLimit;
    }

    /**
     * Pre-flight authorization before spending upstream tokens. Returns the
     * billing source (`free_allowance` or `wallet`) or throws a 422
     * ValidationException when the user's wallet cannot cover the task ceiling.
     *
     * @param array<int, array<string, mixed>> $messages
     */
    public function authorize(
        User $user,
        string $task,
        ?AiModel $model,
        array $messages,
        int $maxOutputTokens,
    ): string {
        if ($this->isEligibleForFreeAllowance($user, $task, $model)) {
            return self::SOURCE_FREE_ALLOWANCE;
        }

        $inUsd = (float) ($model?->in_usd ?? 0);
        $outUsd = (float) ($model?->out_usd ?? 0);

        $maxCostToman = $this->calculateChargeToman(
            $inUsd,
            $outUsd,
            $this->estimatePromptTokens($messages),
            $maxOutputTokens,
        );

        if ($maxCostToman <= 0) {
            return self::SOURCE_WALLET;
        }

        $wallet = $this->walletService->ensureWallet($user);

        if (! $wallet->canPay($maxCostToman)) {
            throw ValidationException::withMessages([
                'wallet' => [
                    "Insufficient wallet balance for this AI request (up to {$maxCostToman} Toman required).",
                ],
            ]);
        }

        return self::SOURCE_WALLET;
    }

    /**
     * Settle actual token usage after the upstream response arrives.
     *
     * @param array<string, mixed> $metadata
     *
     * @return array{cost_toman: int, raw_cost_usd: float, billing_source: string}
     */
    public function settle(
        User $user,
        string $billingSource,
        ?AiModel $model,
        int $inTokens,
        int $outTokens,
        array $metadata = [],
    ): array {
        $inUsd = (float) ($model?->in_usd ?? 0);
        $outUsd = (float) ($model?->out_usd ?? 0);

        $rawUsd = $this->calculateRawUsd($inUsd, $outUsd, $inTokens, $outTokens);

        if ($billingSource === self::SOURCE_FREE_ALLOWANCE) {
            return [
                'cost_toman' => 0,
                'raw_cost_usd' => $rawUsd,
                'billing_source' => self::SOURCE_FREE_ALLOWANCE,
            ];
        }

        $chargeToman = $this->calculateChargeToman($inUsd, $outUsd, $inTokens, $outTokens);

        if ($chargeToman > 0) {
            $this->walletService->withdrawForPurchase(
                $user,
                $chargeToman,
                WalletTransactionType::AiTokenPurchase,
                array_merge($metadata, [
                    'in_tokens' => $inTokens,
                    'out_tokens' => $outTokens,
                    'raw_cost_usd' => $rawUsd,
                    'usd_to_toman' => $this->usdToToman(),
                    'markup_rate' => $this->markupRate(),
                ]),
            );
        }

        return [
            'cost_toman' => $chargeToman,
            'raw_cost_usd' => $rawUsd,
            'billing_source' => self::SOURCE_WALLET,
        ];
    }

    /**
     * Toman pricing breakdown for UI display (`GET /api/v1/ai/models`).
     * Standard turn assumes 1,500 input tokens + 500 output tokens.
     *
     * @return array{
     *   in_toman_per_1m: int,
     *   out_toman_per_1m: int,
     *   estimated_turn_toman: int,
     *   usd_to_toman: int,
     *   markup_rate: float
     * }
     */
    public function modelPricingSummary(AiModel $model): array
    {
        $rate = $this->usdToToman();
        $multiplier = 1.0 + $this->markupRate();

        return [
            'in_toman_per_1m' => (int) ceil((float) $model->in_usd * $rate * $multiplier),
            'out_toman_per_1m' => (int) ceil((float) $model->out_usd * $rate * $multiplier),
            'estimated_turn_toman' => $this->calculateChargeToman(
                (float) $model->in_usd,
                (float) $model->out_usd,
                1500,
                500,
            ),
            'usd_to_toman' => $rate,
            'markup_rate' => $this->markupRate(),
        ];
    }
}
