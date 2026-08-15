<?php

namespace App\Actions\Tickets;

use App\Enums\TicketDepartmentSlug;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Ticket;
use App\Models\TicketDepartment;
use App\Models\User;
use App\Services\Tickets\TicketAttachmentService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CreateTicketAction
{
    public function __construct(
        private readonly TicketAttachmentService $attachments,
    ) {}

    /**
     * @param  array{title:string,body:string,department?:string|null,priority?:string|null,file?:UploadedFile|null}  $data
     */
    public function execute(User $sender, array $data): Ticket
    {
        return DB::transaction(function () use ($sender, $data): Ticket {
            $department = $this->resolveDepartment($data['department'] ?? null);
            $now = now();

            $ticket = Ticket::query()->create([
                'uuid' => (string) Str::uuid(),
                'sender_id' => $sender->id,
                'department_id' => $department->id,
                'title' => $data['title'],
                'status' => TicketStatus::Open,
                'priority' => TicketPriority::tryFrom($data['priority'] ?? '') ?? TicketPriority::Normal,
                'last_message_at' => $now,
                'last_user_read_at' => $now,
            ]);

            $attachment = ($data['file'] ?? null) instanceof UploadedFile
                ? $this->attachments->store($sender, $ticket, $data['file'])
                : null;

            $message = $ticket->messages()->create([
                'user_id' => $sender->id,
                'from_admin' => false,
                'is_internal' => false,
                'body' => $data['body'],
                'file_id' => $attachment?->id,
            ]);


            return $ticket->load([
                'sender.profile.avatar',
                'department',
                'assignedTo',
                'provider.profile.avatar',
                'messages.ticket',
                'messages.user.profile.avatar',
                'messages.attachment',
            ]);
        });
    }

    private function resolveDepartment(?string $slug): TicketDepartment
    {
        if ($slug !== null && $slug !== '') {
            $selected = TicketDepartment::query()
                ->where('is_active', true)
                ->where('slug', $slug)
                ->first();

            if ($selected !== null) {
                return $selected;
            }
        }

        return TicketDepartment::query()
            ->where('is_active', true)
            ->where('is_default', true)
            ->first()
            ?? TicketDepartment::query()
                ->where('is_active', true)
                ->where('slug', TicketDepartmentSlug::Support->value)
                ->firstOrFail();
    }
}
