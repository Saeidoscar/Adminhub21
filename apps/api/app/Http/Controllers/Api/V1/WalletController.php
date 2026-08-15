<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Wallet\DepositAction;
use App\Actions\Wallet\WithdrawAction;
use App\Actions\Wallet\BlockAmountAction;
use App\Actions\Wallet\UnblockAmountAction;
use App\Enums\WalletTransactionType;
use App\Http\Requests\Api\V1\DepositRequest;
use App\Http\Requests\Api\V1\WithdrawRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(
        private readonly DepositAction $deposit,
        private readonly WithdrawAction $withdraw,
        private readonly BlockAmountAction $blockAmount,
        private readonly UnblockAmountAction $unblockAmount,
    ) {}

    public function balance(Request $request): JsonResponse
    {
        $user = $request->user();
        $wallet = $user->wallet;

        return response()->json([
            'balance' => $wallet?->balance ?? 0,
            'withdrawable_balance' => $wallet?->withdrawable_balance ?? 0,
            'blocked_balance' => $wallet?->blocked_balance ?? 0,
        ]);
    }

    public function transactions(Request $request): JsonResponse
    {
        $transactions = $request->user()->walletTransactions()
            ->latest()
            ->paginate();

        return response()->json($transactions);
    }

    public function deposit(DepositRequest $request): JsonResponse
    {
        $transaction = $this->deposit->execute(
            $request->user(),
            $request->validated('amount'),
            WalletTransactionType::OnlineCharge,
            ['gateway' => $request->validated('gateway')]
        );

        return response()->json($transaction, 201);
    }

    public function withdraw(WithdrawRequest $request): JsonResponse
    {
        $transaction = $this->withdraw->execute(
            $request->user(),
            $request->validated('amount'),
            WalletTransactionType::Withdrawal
        );

        return response()->json($transaction, 201);
    }

    public function block(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
        ]);

        $wallet = $this->blockAmount->execute($request->user(), $request->validated('amount'));

        return response()->json($wallet);
    }

    public function unblock(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
        ]);

        $wallet = $this->unblockAmount->execute($request->user(), $request->validated('amount'));

        return response()->json($wallet);
    }
}
