<?php

namespace App\Actions\Tickets;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Services\Tickets\TicketAttachmentService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;

class ReplyToTicketAction
{
    public function __construct(
        private readonly TicketAttachmentService $attachments,
    ) {}

    /**
     * @param  array{body:string,is_internal?:bool,file?:UploadedFile|null}  $data
     */
    public function execute(Ticket $ticket, User $actor, array $data): TicketMessage
    {
        return DB::transaction(function () use ($ticket, $actor, $data): TicketMessage {
            $isStaff = $actor->role === UserRole::ADMIN;
            $isInternal = $isStaff && (bool) ($data['is_internal'] ?? false);
            $attachment = ($data['file'] ?? null) instanceof UploadedFile
                ? $this->attachments->store($actor, $ticket, $data['file'])
                : null;

            $message = $ticket->messages()->create([
                'user_id' => $actor->id,
                'from_admin' => $isStaff,
                'is_internal' => $isInternal,
                'body' => $data['body'],
                'file_id' => $attachment?->id,
            ]);

            $messageAt = $message->created_at ?? now();
            $changes = $isInternal
                ?: ['last_message_at' => $messageAt];

            if ($isStaff) {
                $changes['last_staff_read_at'] = now();
                if (! $isInternal) {
                    $changes['status'] = TicketStatus::Answered;
                    $changes['closed_at'] = null;
                }
            } elseif ((int) $ticket->provider_id === (int) $actor->id) {
                $changes['last_provider_read_at'] = now();
                $changes['status'] = TicketStatus::Pending;
            } else {
                $changes['last_user_read_at'] = now();
                $changes['status'] = TicketStatus::Pending;
            }

            $ticket->notificationActorId = $actor->id;
            $ticket->forceFill($changes)->saveQuietly();

            return $message->load(['user.profile.avatar', 'attachment']);
        });
    }
}
