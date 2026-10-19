<?php

namespace Tests\Feature;

use App\Enums\WalletTransactionStatus;
use App\Models\PaymentGateway;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    private function user(): User
    {
        return User::create([
            'name' => 'Wallet User',
            'email' => uniqid('wallet') . '@test.com',
            'phone' => '+989' . random_int(100000000, 999999999),
            'password' => bcrypt('secret'),
            'role' => 'employer',
        ]);
    }

    private function fund(User $user, int $amount): Wallet
    {
        return Wallet::query()->create([
            'user_id' => $user->id,
            'balance' => $amount,
            'withdrawable_balance' => $amount,
            'blocked_balance' => 0,
        ]);
    }

    public function test_a_fresh_user_sees_a_zero_balance(): void
    {
        Sanctum::actingAs($this->user(), [], 'sanctum');

        $this->getJson('/api/v1/wallet/balance')
            ->assertOk()
            ->assertJsonPath('balance', 0)
            ->assertJsonPath('withdrawable_balance', 0)
            ->assertJsonPath('blocked_balance', 0);
    }

    public function test_a_deposit_request_does_not_credit_the_wallet(): void
    {
        $user = $this->user();
        Sanctum::actingAs($user, [], 'sanctum');

        $this->postJson('/api/v1/wallet/deposit', ['amount' => 50_000_000, 'gateway' => 'zibal'])
            ->assertCreated()
            ->assertJsonPath('status', WalletTransactionStatus::Pending->value)
            ->assertJsonPath('amount', 50_000_000);

        // The critical assertion: no balance was created by the request itself.
        $this->getJson('/api/v1/wallet/balance')->assertJsonPath('balance', 0);
        $this->assertNull($user->fresh()->wallet);
    }

    public function test_a_deposit_requires_a_supported_gateway(): void
    {
        Sanctum::actingAs($this->user(), [], 'sanctum');

        $this->postJson('/api/v1/wallet/deposit', ['amount' => 1000, 'gateway' => 'paypal'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('gateway');

        $this->postJson('/api/v1/wallet/deposit', ['amount' => 1000])
            ->assertStatus(422)
            ->assertJsonValidationErrors('gateway');
    }

    public function test_withdrawing_more_than_the_withdrawable_balance_is_a_422(): void
    {
        $user = $this->user();
        $this->fund($user, 100_000);
        Sanctum::actingAs($user, [], 'sanctum');

        $this->postJson('/api/v1/wallet/withdraw', ['amount' => 150_000])
            ->assertStatus(422)
            ->assertJsonPath('message', 'Insufficient withdrawable balance.');

        $this->assertSame(100_000, $user->fresh()->wallet->balance);
    }

    public function test_withdrawing_without_a_wallet_is_a_422_not_a_404(): void
    {
        Sanctum::actingAs($this->user(), [], 'sanctum');

        $this->postJson('/api/v1/wallet/withdraw', ['amount' => 1_000])->assertStatus(422);
    }

    public function test_a_successful_withdrawal_moves_the_balance_into_a_pending_transaction(): void
    {
        $user = $this->user();
        $this->fund($user, 100_000);
        Sanctum::actingAs($user, [], 'sanctum');

        $this->postJson('/api/v1/wallet/withdraw', ['amount' => 40_000])
            ->assertCreated()
            ->assertJsonPath('status', WalletTransactionStatus::Pending->value);

        $wallet = $user->fresh()->wallet;
        $this->assertSame(60_000, $wallet->balance);
        $this->assertSame(60_000, $wallet->withdrawable_balance);
    }

    public function test_a_transfer_moves_money_and_appears_in_both_statements(): void
    {
        $sender = $this->user();
        $receiver = $this->user();
        $this->fund($sender, 200_000);
        Sanctum::actingAs($sender, [], 'sanctum');

        $this->postJson('/api/v1/wallet/transfer', [
            'receiver_id' => $receiver->id,
            'amount' => 75_000,
        ])->assertCreated();

        $this->assertSame(125_000, $sender->fresh()->wallet->balance);
        $this->assertSame(75_000, $receiver->fresh()->wallet->balance);

        $receiverStatement = WalletTransaction::query()->where('user_id', $receiver->id)->get();
        $this->assertCount(1, $receiverStatement);
        $this->assertSame(75_000, $receiverStatement->first()->amount);
        $this->assertSame($sender->id, $receiverStatement->first()->payload['sender_id']);
    }

    public function test_a_transfer_to_yourself_is_rejected(): void
    {
        $user = $this->user();
        $this->fund($user, 50_000);
        Sanctum::actingAs($user, [], 'sanctum');

        $this->postJson('/api/v1/wallet/transfer', ['receiver_id' => $user->id, 'amount' => 1000])
            ->assertStatus(422);
    }

    public function test_a_transfer_beyond_the_balance_is_rejected_without_moving_money(): void
    {
        $sender = $this->user();
        $receiver = $this->user();
        $this->fund($sender, 10_000);
        Sanctum::actingAs($sender, [], 'sanctum');

        $this->postJson('/api/v1/wallet/transfer', [
            'receiver_id' => $receiver->id,
            'amount' => 10_001,
        ])->assertStatus(422);

        $this->assertSame(10_000, $sender->fresh()->wallet->balance);
        $this->assertNull($receiver->fresh()->wallet);
    }

    public function test_the_transaction_list_is_paginated_and_scoped_to_the_caller(): void
    {
        $me = $this->user();
        $other = $this->user();
        Sanctum::actingAs($me, [], 'sanctum');

        WalletTransaction::query()->create([
            'user_id' => $other->id,
            'amount' => 1_000,
            'direction' => 'deposit',
            'type' => 'deposit',
            'status' => WalletTransactionStatus::Completed->value,
        ]);

        $this->getJson('/api/v1/wallet/transactions')
            ->assertOk()
            ->assertJsonPath('total', 0)
            ->assertJsonPath('data', []);
    }

    public function test_payment_gateways_are_listed_without_their_config(): void
    {
        PaymentGateway::query()->create([
            'code' => 'zibal',
            'name' => 'زیبال',
            'provider' => 'zibal',
            'config' => ['merchant' => 'super-secret-key'],
            'is_active' => true,
        ]);
        PaymentGateway::query()->create([
            'code' => 'sep',
            'name' => 'سامان',
            'provider' => 'sep',
            'is_active' => false,
        ]);

        Sanctum::actingAs($this->user(), [], 'sanctum');

        $response = $this->getJson('/api/v1/payments')->assertOk();

        $response->assertJsonCount(1)->assertJsonPath('0.code', 'zibal');
        $this->assertStringNotContainsString('super-secret-key', $response->getContent());
    }
}
