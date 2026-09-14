<?php

namespace Tests\Feature;

use App\Models\Contract;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ReviewAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    private function employer(string $name, string $email): User
    {
        return User::create([
            'name' => $name,
            'email' => $email,
            'password' => bcrypt('secret'),
            'role' => 'employer',
        ]);
    }

    private function contractFor(User $user): Contract
    {
        return Contract::create([
            'user_id' => $user->id,
            'client_id' => $user->id,
            'title' => 'Review contract',
            'amount' => 100,
            'currency' => 'USD',
        ]);
    }

    public function test_review_store_targets_contract_client_as_target_user(): void
    {
        $employer = $this->employer('Reviewer', 'reviewer@example.test');
        $contract = $this->contractFor($employer);
        Sanctum::actingAs($employer, [], 'sanctum');

        $response = $this->postJson('/api/v1/reviews', [
            'contract_id' => $contract->id,
            'rating' => 5,
            'comment' => 'ok',
        ]);

        $response->assertCreated();
        $this->assertEquals($contract->client_id, Review::first()->target_user_id);
    }

    public function test_review_store_requires_valid_contract(): void
    {
        $employer = $this->employer('Reviewer', 'reviewer2@example.test');
        Sanctum::actingAs($employer, [], 'sanctum');

        $this->postJson('/api/v1/reviews', [
            'contract_id' => 999999,
            'rating' => 5,
            'comment' => 'ok',
        ])->assertUnprocessable();
    }

    public function test_authenticated_user_cannot_list_another_users_reviews(): void
    {
        $employer1 = $this->employer('First', 'first@example.test');
        $employer2 = $this->employer('Second', 'second@example.test');
        $contract = Contract::create([
            'user_id' => $employer2->id,
            'client_id' => $employer2->id,
            'title' => 'Second contract',
            'amount' => 1,
            'currency' => 'USD',
        ]);
        Review::create([
            'user_id' => $employer2->id,
            'target_user_id' => $employer2->id,
            'contract_id' => $contract->id,
            'rating' => 5,
        ]);
        Sanctum::actingAs($employer1, [], 'sanctum');

        $this->getJson("/api/v1/reviews/{$employer2->id}")->assertForbidden();
    }

    public function test_authenticated_user_can_list_own_reviews(): void
    {
        $employer = $this->employer('First', 'first2@example.test');
        $contract = $this->contractFor($employer);
        Review::create([
            'user_id' => $employer->id,
            'target_user_id' => $contract->client_id,
            'contract_id' => $contract->id,
            'rating' => 4,
        ]);
        Sanctum::actingAs($employer, [], 'sanctum');

        $this->getJson("/api/v1/reviews/{$employer->id}")->assertOk();
    }

    public function test_authenticated_user_cannot_update_another_users_review(): void
    {
        $employer1 = $this->employer('First', 'first3@example.test');
        $employer2 = $this->employer('Second', 'second3@example.test');
        $contract = Contract::create([
            'user_id' => $employer1->id,
            'client_id' => $employer1->id,
            'title' => 'First contract',
            'amount' => 1,
            'currency' => 'USD',
        ]);
        $review = Review::create([
            'user_id' => $employer1->id,
            'target_user_id' => $employer1->id,
            'contract_id' => $contract->id,
            'rating' => 5,
        ]);
        Sanctum::actingAs($employer2, [], 'sanctum');

        $this->putJson("/api/v1/reviews/{$review->id}", ['rating' => 1])->assertForbidden();
    }

    public function test_authenticated_user_can_update_own_review(): void
    {
        $employer = $this->employer('First', 'first4@example.test');
        $contract = $this->contractFor($employer);
        $review = Review::create([
            'user_id' => $employer->id,
            'target_user_id' => $contract->client_id,
            'contract_id' => $contract->id,
            'rating' => 4,
        ]);
        Sanctum::actingAs($employer, [], 'sanctum');

        $this->putJson("/api/v1/reviews/{$review->id}", ['rating' => 5])->assertOk();
    }

    public function test_authenticated_user_cannot_delete_another_users_review(): void
    {
        $employer1 = $this->employer('First', 'first5@example.test');
        $employer2 = $this->employer('Second', 'second5@example.test');
        $contract = Contract::create([
            'user_id' => $employer1->id,
            'client_id' => $employer1->id,
            'title' => 'First contract',
            'amount' => 1,
            'currency' => 'USD',
        ]);
        $review = Review::create([
            'user_id' => $employer1->id,
            'target_user_id' => $employer1->id,
            'contract_id' => $contract->id,
            'rating' => 5,
        ]);
        Sanctum::actingAs($employer2, [], 'sanctum');

        $this->deleteJson("/api/v1/reviews/{$review->id}")->assertForbidden();
    }

    public function test_authenticated_user_can_delete_own_review(): void
    {
        $employer = $this->employer('First', 'first6@example.test');
        $contract = $this->contractFor($employer);
        $review = Review::create([
            'user_id' => $employer->id,
            'target_user_id' => $contract->client_id,
            'contract_id' => $contract->id,
            'rating' => 5,
        ]);
        Sanctum::actingAs($employer, [], 'sanctum');

        $this->deleteJson("/api/v1/reviews/{$review->id}")->assertNoContent();
    }
}
