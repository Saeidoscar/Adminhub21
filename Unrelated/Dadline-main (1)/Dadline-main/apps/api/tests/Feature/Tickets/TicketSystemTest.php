<?php

namespace Tests\Feature\Tickets;

use App\Actions\Tickets\ReplyToTicketAction;
use App\Actions\Tickets\UpdateTicketAction;
use App\Enums\TicketDepartmentSlug;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketDepartment;
use App\Models\User;
use App\Services\Notifications\DomainNotificationService;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class TicketSystemTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(ThrottleRequests::class);
        $this->mock(DomainNotificationService::class)->shouldIgnoreMissing();
    }

    public function test_user_can_create_a_ticket_with_default_department_and_first_message(): void
    {
        $user = $this->user('09120000001');
        Sanctum::actingAs($user);

        $response = $this->postJson('/v1/tickets', [
            'title' => 'پیگیری مشکل قرارداد',
            'body' => 'برای مشاهده قرارداد ثبت‌شده با مشکل مواجه شده‌ام.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.department.slug', TicketDepartmentSlug::Support->value)
            ->assertJsonPath('data.priority', TicketPriority::Normal->value)
            ->assertJsonPath('data.status', TicketStatus::Open->value)
            ->assertJsonPath('data.messages.0.body', 'برای مشاهده قرارداد ثبت‌شده با مشکل مواجه شده‌ام.');

        $this->assertDatabaseHas('tickets', [
            'sender_id' => $user->id,
            'priority' => TicketPriority::Normal->value,
            'status' => TicketStatus::Open->value,
        ]);
        $this->assertDatabaseHas('ticket_messages', [
            'user_id' => $user->id,
            'from_admin' => false,
            'is_internal' => false,
        ]);
    }

    public function test_unrelated_user_cannot_view_or_reply_to_a_ticket(): void
    {
        $owner = $this->user('09120000002');
        $other = $this->user('09120000003');
        $ticket = $this->ticketFor($owner);

        Sanctum::actingAs($other);

        $this->getJson("/v1/tickets/{$ticket->uuid}")->assertForbidden();
        $this->postJson("/v1/tickets/{$ticket->uuid}/messages", [
            'body' => 'این پیام نباید ثبت شود.',
        ])->assertForbidden();
    }

    public function test_assigned_provider_can_participate_but_cannot_see_internal_notes(): void
    {
        $owner = $this->user('09120000004');
        $provider = $this->user('09120000005', 'legal_expert');
        $admin = $this->user('09120000006', 'admin');
        $ticket = $this->ticketFor($owner);
        $ticket->update(['provider_id' => $provider->id]);

        app(ReplyToTicketAction::class)->execute($ticket->fresh(), $admin, [
            'body' => 'این یادداشت فقط برای تیم پشتیبانی است.',
            'is_internal' => true,
        ]);

        Sanctum::actingAs($provider);
        $this->getJson("/v1/tickets/{$ticket->uuid}")
            ->assertOk()
            ->assertJsonMissing(['body' => 'این یادداشت فقط برای تیم پشتیبانی است.']);

        $this->postJson("/v1/tickets/{$ticket->uuid}/messages", [
            'body' => 'توضیحات تخصصی پراوایدر برای رفع اختلاف.',
            'is_internal' => true,
        ])->assertCreated()
            ->assertJsonPath('data.actorType', 'provider')
            ->assertJsonPath('data.isInternal', false);
    }

    public function test_admin_can_refer_ticket_assign_department_supporter_and_attach_provider(): void
    {
        $owner = $this->user('09120000007');
        $admin = $this->user('09120000008', 'admin');
        $provider = $this->user('09120000009', 'lawyer_bonyad');
        $ticket = $this->ticketFor($owner);
        $department = TicketDepartment::query()
            ->where('slug', TicketDepartmentSlug::Contracts->value)
            ->firstOrFail();
        $department->supporters()->attach($admin->id);

        $updated = app(UpdateTicketAction::class)->execute($ticket, $admin, [
            'department_id' => $department->id,
            'assigned_to_id' => $admin->id,
            'provider_id' => $provider->id,
            'priority' => TicketPriority::High->value,
            'status' => TicketStatus::Referred->value,
        ]);

        $this->assertSame($department->id, $updated->department_id);
        $this->assertSame($admin->id, $updated->assigned_to_id);
        $this->assertSame($provider->id, $updated->provider_id);
        $this->assertSame(TicketPriority::High, $updated->priority);
        $this->assertSame(TicketStatus::Referred, $updated->status);
    }

    public function test_internal_note_does_not_create_user_unread_activity_or_change_status(): void
    {
        $owner = $this->user('09120000010');
        $admin = $this->user('09120000011', 'admin');
        $ticket = $this->ticketFor($owner);
        $lastMessageAt = $ticket->last_message_at;

        app(ReplyToTicketAction::class)->execute($ticket, $admin, [
            'body' => 'یادداشت داخلی برای ادامه بررسی پرونده.',
            'is_internal' => true,
        ]);

        $ticket->refresh();
        $this->assertTrue($ticket->last_message_at->equalTo($lastMessageAt));
        $this->assertSame(TicketStatus::Open, $ticket->status);
    }


    public function test_manager_role_cannot_bypass_ticket_ownership_through_user_api(): void
    {
        $owner = $this->user('09120000012');
        $manager = $this->user('09120000013', 'manager');
        $ticket = $this->ticketFor($owner);

        Sanctum::actingAs($manager);

        $this->getJson("/v1/tickets/{$ticket->uuid}")->assertForbidden();
        $this->postJson("/v1/tickets/{$ticket->uuid}/messages", [
            'body' => 'دسترسی مدیریتی عمومی نباید از این مسیر ممکن باشد.',
        ])->assertForbidden();
    }

    public function test_status_update_response_never_exposes_internal_notes_to_owner(): void
    {
        $owner = $this->user('09120000014');
        $admin = $this->user('09120000015', 'admin');
        $ticket = $this->ticketFor($owner);

        app(ReplyToTicketAction::class)->execute($ticket, $admin, [
            'body' => 'یادداشت محرمانه تیم رسیدگی.',
            'is_internal' => true,
        ]);

        Sanctum::actingAs($owner);
        $this->patchJson("/v1/tickets/{$ticket->uuid}/status", [
            'status' => TicketStatus::Closed->value,
        ])->assertOk()
            ->assertJsonPath('data.status', TicketStatus::Closed->value)
            ->assertJsonMissing(['body' => 'یادداشت محرمانه تیم رسیدگی.']);
    }

    public function test_public_admin_reply_reopens_a_closed_ticket_without_stale_closed_at(): void
    {
        $owner = $this->user('09120000016');
        $admin = $this->user('09120000017', 'admin');
        $ticket = $this->ticketFor($owner);
        $ticket->forceFill([
            'status' => TicketStatus::Closed,
            'closed_at' => now(),
        ])->saveQuietly();

        app(ReplyToTicketAction::class)->execute($ticket->fresh(), $admin, [
            'body' => 'پاسخ عمومی پشتیبانی و ادامه رسیدگی.',
            'is_internal' => false,
        ]);

        $ticket->refresh();
        $this->assertSame(TicketStatus::Answered, $ticket->status);
        $this->assertNull($ticket->closed_at);
    }


    public function test_initial_ticket_message_does_not_send_a_duplicate_message_notification(): void
    {
        $owner = $this->user('09120000018');
        $ticket = $this->ticketFor($owner);
        $message = $ticket->messages()->firstOrFail();

        $dispatcher = \Mockery::mock(NotificationDispatcher::class);
        $dispatcher->shouldNotReceive('dispatch');

        (new DomainNotificationService($dispatcher))->ticketMessageCreated($message);
    }


    private function ticketFor(User $owner): Ticket
    {
        $department = TicketDepartment::query()
            ->where('slug', TicketDepartmentSlug::Support->value)
            ->firstOrFail();
        $now = now()->startOfSecond();

        $ticket = Ticket::query()->create([
            'uuid' => (string) Str::uuid(),
            'sender_id' => $owner->id,
            'department_id' => $department->id,
            'title' => 'تیکت آزمایشی معتبر',
            'status' => TicketStatus::Open,
            'priority' => TicketPriority::Normal,
            'last_message_at' => $now,
            'last_user_read_at' => $now,
        ]);
        $ticket->messages()->create([
            'user_id' => $owner->id,
            'body' => 'متن اولیه و کامل تیکت آزمایشی.',
            'from_admin' => false,
            'is_internal' => false,
        ]);

        return $ticket->fresh();
    }

    private function user(string $mobile, string $role = 'user'): User
    {
        return User::query()->create([
            'first_name' => 'کاربر',
            'last_name' => substr($mobile, -2),
            'mobile' => $mobile,
            'role' => $role,
        ]);
    }
}
