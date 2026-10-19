<?php

namespace Tests\Feature;

use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketTest extends TestCase
{
    use RefreshDatabase;

    private function user(string $role = 'employer'): User
    {
        return User::create([
            'name' => 'Ticket User',
            'email' => uniqid('ticket') . '@test.com',
            'phone' => '+989' . random_int(100000000, 999999999),
            'password' => bcrypt('secret'),
            'role' => $role,
        ]);
    }

    private function ticketFor(User $owner): Ticket
    {
        return Ticket::create([
            'user_id' => $owner->id,
            'subject' => 'Invoice mismatch',
            'description' => 'The invoice total is wrong.',
            'priority' => 'medium',
            'status' => TicketStatus::Open->value,
        ]);
    }

    public function test_creating_a_ticket_honours_the_requested_priority(): void
    {
        $user = $this->user();
        Sanctum::actingAs($user, [], 'sanctum');

        $this->postJson('/api/v1/tickets', [
            'subject' => 'Urgent issue',
            'description' => 'Cannot withdraw.',
            'priority' => 'urgent',
        ])
            ->assertCreated()
            ->assertJsonPath('status', TicketStatus::Open->value)
            ->assertJsonPath('priority', 'urgent');
    }

    public function test_replying_to_a_ticket_succeeds(): void
    {
        $owner = $this->user();
        $ticket = $this->ticketFor($owner);
        Sanctum::actingAs($owner, [], 'sanctum');

        $this->postJson("/api/v1/tickets/{$ticket->id}/reply", ['body' => 'Any update?'])
            ->assertCreated()
            ->assertJsonPath('body', 'Any update?');

        $this->assertNotNull($ticket->fresh()->last_message_at);
        $this->assertCount(1, $ticket->fresh()->messages);
    }

    public function test_reading_a_ticket_in_every_status_works(): void
    {
        $owner = $this->user();
        Sanctum::actingAs($owner, [], 'sanctum');

        foreach (['open', 'in_progress', 'resolved', 'closed'] as $status) {
            $ticket = $this->ticketFor($owner);
            $ticket->update(['status' => $status]);

            $this->getJson("/api/v1/tickets/{$ticket->id}")
                ->assertOk()
                ->assertJsonPath('status', $status);
        }
    }

    public function test_a_requester_never_sees_internal_staff_notes(): void
    {
        $owner = $this->user();
        $agent = $this->user('admin');
        $ticket = $this->ticketFor($owner);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $owner->id,
            'body' => 'Public question',
            'is_internal' => false,
        ]);
        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $agent->id,
            'body' => 'Internal: customer seems upset',
            'is_internal' => true,
        ]);

        Sanctum::actingAs($owner, [], 'sanctum');

        $response = $this->getJson("/api/v1/tickets/{$ticket->id}")->assertOk();
        $response->assertJsonCount(1, 'messages');
        $this->assertStringNotContainsString('customer seems upset', $response->getContent());
    }

    public function test_staff_can_see_internal_notes(): void
    {
        $owner = $this->user();
        $agent = $this->user('admin');
        $ticket = $this->ticketFor($owner);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => $agent->id,
            'body' => 'Internal note',
            'is_internal' => true,
        ]);

        Sanctum::actingAs($agent, [], 'sanctum');

        $this->getJson("/api/v1/tickets/{$ticket->id}")
            ->assertOk()
            ->assertJsonCount(1, 'messages');
    }

    public function test_a_requester_cannot_post_an_internal_note(): void
    {
        $owner = $this->user();
        $ticket = $this->ticketFor($owner);
        Sanctum::actingAs($owner, [], 'sanctum');

        $this->postJson("/api/v1/tickets/{$ticket->id}/reply", [
            'body' => 'Sneaky',
            'is_internal' => true,
        ])->assertStatus(422);
    }

    public function test_a_requester_cannot_reassign_or_reprioritise_their_ticket(): void
    {
        $owner = $this->user();
        $stranger = $this->user();
        $ticket = $this->ticketFor($owner);
        Sanctum::actingAs($owner, [], 'sanctum');

        $this->putJson("/api/v1/tickets/{$ticket->id}", ['assigned_to' => $stranger->id])
            ->assertStatus(422);

        $this->putJson("/api/v1/tickets/{$ticket->id}", ['priority' => 'urgent'])
            ->assertStatus(422);

        // Closing your own ticket is fine.
        $this->putJson("/api/v1/tickets/{$ticket->id}", ['status' => 'closed'])->assertOk();
        $this->assertNotNull($ticket->fresh()->resolved_at);
    }

    public function test_the_ticket_list_is_scoped_and_filterable(): void
    {
        $me = $this->user();
        $other = $this->user();
        $this->ticketFor($other);

        $open = $this->ticketFor($me);
        $closed = $this->ticketFor($me);
        $closed->update(['status' => 'closed']);

        Sanctum::actingAs($me, [], 'sanctum');

        $this->getJson('/api/v1/tickets')
            ->assertOk()
            ->assertJsonPath('total', 2);

        $this->getJson('/api/v1/tickets?status=closed')
            ->assertOk()
            ->assertJsonPath('total', 1)
            ->assertJsonFragment(['id' => $closed->id]);

        $this->getJson('/api/v1/tickets?status=open')
            ->assertJsonPath('total', 1)
            ->assertJsonFragment(['id' => $open->id]);
    }

    public function test_a_stranger_cannot_read_a_ticket(): void
    {
        $ticket = $this->ticketFor($this->user());
        Sanctum::actingAs($this->user(), [], 'sanctum');

        $this->getJson("/api/v1/tickets/{$ticket->id}")->assertForbidden();
    }
}
