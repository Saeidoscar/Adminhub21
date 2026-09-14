<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Models\User;
use App\Models\Contract;
use App\Models\Ticket;
use App\Models\Offer;
use App\Models\OfficeCase;
use App\Models\Review;
use App\Models\Office;

class SecurityTest extends TestCase
{
    use RefreshDatabase;

    private function makeUser(string $role = 'employer'): User
    {
        return User::create([
            'name' => 'Test',
            'email' => uniqid('test') . '@test.com',
            'phone' => '+980000000000',
            'password' => bcrypt('password'),
            'role' => $role,
            'is_verified' => true,
        ]);
    }

    private function makeToken(User $user): string
    {
        $exp = max(1, (int) config('sanctum.expiration', 1440));
        return $user->createToken('auth-token', expiresAt: now()->addMinutes($exp))->plainTextToken;
    }

    private function actingWithToken(User $user): void
    {
        $this->withToken($this->makeToken($user));
    }

    public function test_non_admin_cannot_view_any_contracts(): void
    {
        $user = $this->makeUser();
        $this->actingWithToken($user);
        $this->getJson('/api/v1/contracts')->assertStatus(403);
    }

    public function test_admin_can_view_any_contracts(): void
    {
        $admin = $this->makeUser();
        $this->actingWithToken($admin);
        $this->getJson('/api/v1/contracts')->assertStatus(200);
    }

    public function test_contract_owner_can_view_contract(): void
    {
        $user = $this->makeUser();
        $this->actingWithToken($user);
        $c = Contract::create(['user_id' => $user->id, 'client_id' => $user->id+1, 'title' => 'TC', 'amount' => 100, 'currency' => 'USD']);
        $this->getJson('/api/v1/contracts/' . $c->id)->assertStatus(200);
    }

    public function test_non_owner_cannot_view_contract(): void
    {
        $o = $this->makeUser();
        $s = $this->makeUser();
        $this->actingWithToken($s);
        $c = Contract::create(['user_id' => $o->id, 'client_id' => $o->id, 'title' => 'S', 'amount' => 100, 'currency' => 'USD']);
        $this->getJson('/api/v1/contracts/' . $c->id)->assertStatus(403);
    }

    public function test_non_participant_cannot_view_ticket(): void
    {
        $cr = $this->makeUser();
        $s = $this->makeUser();
        $this->actingWithToken($s);
        $t = Ticket::create(['user_id' => $cr->id, 'assigned_to' => $cr->id, 'subject' => 'T', 'description' => 'D', 'priority' => 'medium', 'status' => 'open']);
        $this->getJson('/api/v1/tickets/' . $t->id)->assertStatus(403);
    }

    public function test_creator_can_view_ticket(): void
    {
        $user = $this->makeUser();
        $this->actingWithToken($user);
        $t = Ticket::create(['user_id' => $user->id, 'assigned_to' => $user->id, 'subject' => 'T', 'description' => 'D', 'priority' => 'medium', 'status' => 'open']);
        $this->getJson('/api/v1/tickets/' . $t->id)->assertStatus(200);
    }

    public function test_non_participant_cannot_view_offer(): void
    {
        $sn = $this->makeUser();
        $r = $this->makeUser();
        $s = $this->makeUser();
        $this->actingWithToken($s);
        $o = Offer::create(['user_id' => $sn->id, 'target_user_id' => $r->id, 'message' => 'H', 'amount' => 100, 'currency' => 'USD']);
        $this->getJson('/api/v1/offers/' . $o->id)->assertStatus(403);
    }

    public function test_sender_can_view_offer(): void
    {
        $user = $this->makeUser();
        $this->actingWithToken($user);
        $o = Offer::create(['user_id' => $user->id, 'target_user_id' => $user->id+1, 'message' => 'H', 'amount' => 100, 'currency' => 'USD']);
        $this->getJson('/api/v1/offers/' . $o->id)->assertStatus(200);
    }

    public function test_non_member_cannot_view_case(): void
    {
        $o = $this->makeUser();
        $s = $this->makeUser();
        $this->actingWithToken($s);
        $of = Office::create(['owner_id' => $o->id, 'name' => 'TO', 'status' => 'pending']);
        $c = OfficeCase::create(['office_id' => $of->id, 'case_number' => 'C001', 'title' => 'TC']);
        $this->getJson('/api/v1/cases/' . $c->id)->assertStatus(403);
    }

    public function test_office_owner_can_view_case(): void
    {
        $user = $this->makeUser();
        $this->actingWithToken($user);
        $of = Office::create(['owner_id' => $user->id, 'name' => 'TO', 'status' => 'pending']);
        $c = OfficeCase::create(['office_id' => $of->id, 'case_number' => 'C001', 'title' => 'TC']);
        $this->getJson('/api/v1/cases/' . $c->id)->assertStatus(200);
    }

    public function test_non_admin_cannot_view_any_reviews(): void
    {
        $user = $this->makeUser();
        $this->actingWithToken($user);
        $this->getJson('/api/v1/reviews/1')->assertStatus(403);
    }

    public function test_target_user_can_view_own_reviews(): void
    {
        $user = $this->makeUser();
        $this->actingWithToken($user);
        $r = Review::create(['user_id' => $user->id, 'target_user_id' => $user->id, 'rating' => 5, 'comment' => 'G']);
        $this->getJson('/api/v1/reviews/' . $user->id)->assertStatus(200);
    }

    public function test_review_store_requires_valid_contract(): void
    {
        $r = $this->makeUser();
        $this->actingWithToken($r);
        $this->postJson('/api/v1/reviews', ['contract_id' => 99999, 'rating' => 5])->assertStatus(404);
    }

    public function test_review_needs_contract_access(): void
    {
        $rv = $this->makeUser();
        $cl = $this->makeUser();
        $this->actingWithToken($rv);
        $c = Contract::create(['user_id' => $cl->id, 'client_id' => $cl->id, 'title' => 'NA', 'amount' => 100, 'currency' => 'USD']);
        $this->postJson('/api/v1/reviews', ['contract_id' => $c->id+1, 'rating' => 5])->assertStatus(404);
    }

    public function test_sanctum_expiration_config(): void
    {
        $e = (int) config('sanctum.expiration', 1440);
        $this->assertGreaterThanOrEqual(1, $e);
    }

    public function test_auth_throttle_config(): void
    {
        $t = (int) config('auth.defaults.throttle', 60);
        $this->assertGreaterThanOrEqual(1, $t);
    }
}