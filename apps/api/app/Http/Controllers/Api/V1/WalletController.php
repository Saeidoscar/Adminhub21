<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Wallet\BlockAmountAction;
use App\Actions\Wallet\TransferAction;
use App\Actions\Wallet\UnblockAmountAction;
use App\Actions\Wallet\WithdrawAction;
use App\Enums\PaymentGateway;
use App\Enums\WalletTransactionType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Api\V1\DepositRequest;
use App\Http\Requests\Api\V1\WithdrawRequest;
use App\Models\User;
use App\Services\Payments\PaymentGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WalletController extends Controller
{
    public function __construct(
        private readonly PaymentGatewayService $gateways,
        private readonly WithdrawAction $withdraw,
        private readonly BlockAmountAction $blockAmount,
        private readonly UnblockAmountAction $unblockAmount,
        private readonly TransferAction $transfer,
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

    /**
     * Starts a wallet top-up through a payment gateway.
     *
     * The wallet is NOT credited here: this creates a pending transaction and
     * the money is settled only by the verified gateway callback. Crediting on
     * request would let any authenticated user mint balance.
     */
    public function deposit(DepositRequest $request): JsonResponse
    {
        $transaction = $this->gateways->initiate(
            $request->user(),
            PaymentGateway::from($request->validated('gateway') ?? PaymentGateway::Zibal->value),
            $request->validated('amount'),
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

    /**
     * Internal: reserves funds for escrow. Deliberately unrouted; exposing it
     * would let a user freeze their own balance at will.
     */
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

    public function transfer(Request $request): JsonResponse
    {
        $request->validate([
            'receiver_id' => ['required', 'integer', 'exists:users,id'],
            'amount' => ['required', 'integer', 'min:1'],
        ]);

        $receiver = User::query()->findOrFail($request->receiver_id);

        if ($receiver->id === $request->user()->id) {
            return response()->json(['message' => 'Cannot transfer to yourself.'], 422);
        }

        $transaction = $this->transfer->execute(
            $request->user(),
            $receiver,
            $request->validated('amount'),
            WalletTransactionType::Transfer
        );

        return response()->json($transaction, 201);
    }
}
