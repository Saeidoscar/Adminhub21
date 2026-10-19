<?php

namespace Tests\Feature;

use App\Enums\ContractStatus;
use App\Models\Contract;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ContractLifecycleTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role = 'employer'): User
    {
        return User::create([
            'name' => 'Contract User',
            'email' => uniqid('contract') . '@test.com',
            'phone' => '+989' . random_int(100000000, 999999999),
            'password' => bcrypt('secret'),
            'role' => $role,
        ]);
    }

    private function contractFor(User $employer, User $client): Contract
    {
        return Contract::create([
            'user_id' => $employer->id,
            'client_id' => $client->id,
            'title' => 'Design retainer',
            'amount' => 5_000_000,
            'currency' => 'IRR',
            'status' => ContractStatus::Draft->value,
        ]);
    }

    public function test_contract_list_only_contains_contracts_you_are_part_of(): void
    {
        $me = $this->user();
        $counterparty = $this->user();
        $stranger = $this->user();

        $mine = $this->contractFor($me, $counterparty);
        $asClient = $this->contractFor($counterparty, $me);
        $this->contractFor($stranger, $counterparty);

        Sanctum::actingAs($me, [], 'sanctum');

        $this->getJson('/api/v1/contracts')
            ->assertOk()
            ->assertJsonPath('total', 2)
            ->assertJsonFragment(['id' => $mine->id])
            ->assertJsonFragment(['id' => $asClient->id]);
    }

    public function test_contract_list_can_be_filtered_by_status(): void
    {
        $me = $this->user();
        $other = $this->user();
        $this->contractFor($me, $other);

        $active = $this->contractFor($me, $other);
        $active->update(['status' => ContractStatus::Active->value]);

        Sanctum::actingAs($me, [], 'sanctum');

        $this->getJson('/api/v1/contracts?status=active')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonFragment(['id' => $active->id]);
    }

    public function test_signing_moves_a_draft_to_pending(): void
    {
        $me = $this->user();
        $contract = $this->contractFor($me, $this->user());
        Sanctum::actingAs($me, [], 'sanctum');

        $this->postJson("/api/v1/contracts/{$contract->id}/sign", ['name' => 'Saeid'])
            ->assertOk()
            ->assertJsonPath('status', ContractStatus::Pending->value);

        $this->assertNotNull($contract->fresh()->signed_at);
        $this->assertCount(1, $contract->fresh()->signatures);
    }

    public function test_a_contract_cannot_be_signed_twice_after_completion(): void
    {
        $me = $this->user();
        $contract = $this->contractFor($me, $this->user());
        $contract->update(['status' => ContractStatus::Completed->value]);
        Sanctum::actingAs($me, [], 'sanctum');

        $this->postJson("/api/v1/contracts/{$contract->id}/sign", ['name' => 'Saeid'])
            ->assertStatus(422);
    }

    public function test_only_a_signed_contract_can_be_activated(): void
    {
        $me = $this->user();
        $contract = $this->contractFor($me, $this->user());
        Sanctum::actingAs($me, [], 'sanctum');

        $this->postJson("/api/v1/contracts/{$contract->id}/activate")
            ->assertStatus(422)
            ->assertJsonPath('message', 'The contract must be signed before it can be activated.');

        $this->postJson("/api/v1/contracts/{$contract->id}/sign", ['name' => 'Saeid'])->assertOk();

        $this->postJson("/api/v1/contracts/{$contract->id}/activate")
            ->assertOk()
            ->assertJsonPath('status', ContractStatus::Active->value);

        $this->assertNotNull($contract->fresh()->starts_at);
    }

    public function test_only_an_active_contract_can_be_completed(): void
    {
        $me = $this->user();
        $contract = $this->contractFor($me, $this->user());
        Sanctum::actingAs($me, [], 'sanctum');

        $this->postJson("/api/v1/contracts/{$contract->id}/complete")->assertStatus(422);

        $contract->update(['status' => ContractStatus::Active->value]);

        $this->postJson("/api/v1/contracts/{$contract->id}/complete")
            ->assertOk()
            ->assertJsonPath('status', ContractStatus::Completed->value);

        $this->assertNotNull($contract->fresh()->ends_at);
    }

    public function test_a_cancelled_contract_cannot_be_cancelled_again(): void
    {
        $me = $this->user();
        $contract = $this->contractFor($me, $this->user());
        Sanctum::actingAs($me, [], 'sanctum');

        $this->postJson("/api/v1/contracts/{$contract->id}/cancel")
            ->assertOk()
            ->assertJsonPath('status', ContractStatus::Cancelled->value);

        $this->postJson("/api/v1/contracts/{$contract->id}/cancel")->assertStatus(422);
    }

    public function test_a_stranger_cannot_touch_the_lifecycle(): void
    {
        $me = $this->user();
        $stranger = $this->user();
        $contract = $this->contractFor($me, $this->user());

        Sanctum::actingAs($stranger, [], 'sanctum');

        $this->getJson("/api/v1/contracts/{$contract->id}")->assertForbidden();
        $this->postJson("/api/v1/contracts/{$contract->id}/sign", ['name' => 'X'])->assertForbidden();
        $this->postJson("/api/v1/contracts/{$contract->id}/cancel")->assertForbidden();
    }

    public function test_a_counterparty_can_be_resolved_by_exact_email(): void
    {
        $me = $this->user();
        $client = $this->user();
        Sanctum::actingAs($me, [], 'sanctum');

        $this->getJson('/api/v1/users/lookup?email=' . urlencode($client->email))
            ->assertOk()
            ->assertJsonPath('id', $client->id)
            ->assertJsonMissingPath('phone');

        $this->getJson('/api/v1/users/lookup?email=nobody@example.test')->assertNotFound();
    }

    public function test_creating_a_contract_defaults_to_draft(): void
    {
        $me = $this->user();
        $client = $this->user();
        Sanctum::actingAs($me, [], 'sanctum');

        $this->postJson('/api/v1/contracts', [
            'title' => 'Landing page',
            'amount' => 12_000_000,
            'currency' => 'IRR',
            'client_id' => $client->id,
        ])
            ->assertCreated()
            ->assertJsonPath('status', ContractStatus::Draft->value)
            ->assertJsonPath('user_id', $me->id)
            ->assertJsonPath('client_id', $client->id);
    }
}
