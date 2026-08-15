<?php

namespace App\Actions\Tickets;

use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Models\Ticket;
use App\Models\TicketDepartment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class UpdateTicketAction
{
    /**
     * @param  array<string, mixed>  $data
     */
    public function execute(Ticket $ticket, User $actor, array $data): Ticket
    {
        return DB::transaction(function () use ($ticket, $actor, $data): Ticket {
            $trackedFields = [
                'department_id',
                'assigned_to_id',
                'provider_id',
                'status',
                'priority',
            ];
            $before = collect($trackedFields)
                ->mapWithKeys(fn (string $field) => [$field => $ticket->getRawOriginal($field)])
                ->all();

            if (array_key_exists('department_id', $data)) {
                $department = TicketDepartment::query()->findOrFail($data['department_id']);
                if (! $department->is_active) {
                    throw ValidationException::withMessages([
                        'department_id' => 'امکان ارجاع تیکت به دپارتمان غیرفعال وجود ندارد.',
                    ]);
                }

                $ticket->department()->associate($department);
                $ticket->setRelation('department', $department);

                if (
                    $ticket->assigned_to_id !== null
                    && ! $department->supporters()->whereKey($ticket->assigned_to_id)->exists()
                ) {
                    $ticket->assigned_to_id = null;
                }
            } else {
                $ticket->loadMissing('department');
            }

            if (array_key_exists('assigned_to_id', $data)) {
                $ticket->assigned_to_id = $this->validatedAssignee($ticket, $data['assigned_to_id']);
            }

            if (array_key_exists('provider_id', $data)) {
                $ticket->provider_id = $this->validatedProvider($data['provider_id']);
                $ticket->ref_user_id = $ticket->provider_id;
            }

            if (array_key_exists('status', $data)) {
                $ticket->status = $data['status'];
                $ticket->closed_at = $data['status'] === TicketStatus::Closed->value ? now() : null;
            }

            if (array_key_exists('priority', $data)) {
                $ticket->priority = $data['priority'];
            }

            $ticket->notificationActorId = $actor->id;
            $ticket->notificationPrevious = $before;
            $ticket->save();

            return $ticket->load([
                'sender.profile.avatar',
                'department.supporters',
                'assignedTo.profile.avatar',
                'provider.profile.avatar',
            ]);
        });
    }

    private function validatedAssignee(Ticket $ticket, mixed $userId): ?int
    {
        if ($userId === null || $userId === '') {
            return null;
        }

        $user = User::query()->findOrFail((int) $userId);
        if ($user->role !== UserRole::ADMIN) {
            throw ValidationException::withMessages([
                'assigned_to_id' => 'پشتیبان انتخاب‌شده دسترسی مدیریتی معتبر ندارد.',
            ]);
        }

        if (! $ticket->department?->supporters()->whereKey($user->id)->exists()) {
            throw ValidationException::withMessages([
                'assigned_to_id' => 'پشتیبان انتخاب‌شده عضو دپارتمان تیکت نیست.',
            ]);
        }

        return $user->id;
    }

    private function validatedProvider(mixed $userId): ?int
    {
        if ($userId === null || $userId === '') {
            return null;
        }

        $provider = User::query()->findOrFail((int) $userId);
        if (! ($provider->role->isLawyer() || $provider->role->isExpert())) {
            throw ValidationException::withMessages([
                'provider_id' => 'کاربر انتخاب‌شده وکیل یا کارشناس حقوقی معتبر نیست.',
            ]);
        }

        return $provider->id;
    }
}
