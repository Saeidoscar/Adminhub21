<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Tickets\UpdateTicketAction;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tickets\AdminTicketIndexRequest;
use App\Http\Requests\Tickets\AdminUpdateTicketRequest;
use App\Http\Resources\Tickets\TicketDepartmentResource;
use App\Http\Resources\Tickets\TicketResource;
use App\Models\Ticket;
use App\Models\TicketDepartment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Str;

class TicketController extends Controller
{
    public function index(AdminTicketIndexRequest $request): JsonResponse
    {
        $tickets = Ticket::query()
            ->with([
                'department',
                'sender.profile.avatar',
                'assignedTo.profile.avatar',
                'provider.profile.avatar',
                'latestMessage.ticket',
                'latestMessage.user.profile.avatar',
                'latestMessage.attachment',
            ])
            ->when($request->validated('q'), function ($query, string $q): void {
                $query->where(function ($query) use ($q): void {
                    $query->where('title', 'like', "%{$q}%")
                        ->when(Str::isUuid($q), fn ($query) => $query->orWhere('uuid', $q))
                        ->orWhereHas('sender', fn ($query) => $query
                            ->where('first_name', 'like', "%{$q}%")
                            ->orWhere('last_name', 'like', "%{$q}%")
                            ->orWhere('mobile', 'like', "%{$q}%"))
                        ->orWhereHas('messages', fn ($query) => $query->where('body', 'like', "%{$q}%"));
                });
            })
            ->when($request->validated('status'), fn ($query, string $status) => $query->where('status', $status))
            ->when($request->validated('priority'), fn ($query, string $priority) => $query->where('priority', $priority))
            ->when($request->validated('department_id'), fn ($query, int $departmentId) => $query->where('department_id', $departmentId))
            ->when($request->validated('assigned_to_id'), fn ($query, int $userId) => $query->where('assigned_to_id', $userId))
            ->when($request->validated('provider_id'), fn ($query, int $userId) => $query->where('provider_id', $userId))
            ->orderByRaw("CASE priority WHEN 'urgent' THEN 1 WHEN 'high' THEN 2 WHEN 'normal' THEN 3 ELSE 4 END")
            ->orderByDesc('last_message_at')
            ->paginate($request->integer('per_page', 20));

        return response()->json([
            'data' => TicketResource::collection($tickets->getCollection())->resolve($request),
            'meta' => [
                'currentPage' => $tickets->currentPage(),
                'lastPage' => $tickets->lastPage(),
                'perPage' => $tickets->perPage(),
                'total' => $tickets->total(),
            ],
            'filters' => $this->filters(),
        ]);
    }

    public function show(Ticket $ticket): TicketResource
    {
        $ticket->markReadBy(request()->user());
        $ticket->load([
            'department.supporters',
            'sender.profile.avatar',
            'assignedTo.profile.avatar',
            'provider.profile.avatar',
            'messages' => fn ($query) => $query->oldest('id'),
            'messages.ticket',
            'messages.user.profile.avatar',
            'messages.attachment',
        ]);

        return new TicketResource($ticket);
    }

    public function update(
        AdminUpdateTicketRequest $request,
        Ticket $ticket,
        UpdateTicketAction $action,
    ): TicketResource {
        $updated = $action->execute($ticket, $request->user(), $request->validated());
        $updated->markReadBy($request->user());
        $updated->load([
            'department.supporters',
            'sender.profile.avatar',
            'assignedTo.profile.avatar',
            'provider.profile.avatar',
            'messages' => fn ($query) => $query->oldest('id'),
            'messages.ticket',
            'messages.user.profile.avatar',
            'messages.attachment',
        ]);

        return new TicketResource($updated);
    }

    public function meta(): JsonResponse
    {
        $providerRoles = collect(UserRole::cases())
            ->filter(fn (UserRole $role) => $role->isLawyer() || $role->isExpert())
            ->pluck('value');

        return response()->json([
            'data' => [
                ...$this->filters(),
                'providers' => User::query()
                    ->whereIn('role', $providerRoles)
                    ->orderByDesc('last_login_at')
                    ->limit(150)
                    ->get(['id', 'first_name', 'last_name', 'mobile', 'role'])
                    ->map(fn (User $user) => [
                        'id' => $user->id,
                        'name' => $user->full_name,
                        'mobile' => $user->mobile,
                        'role' => $user->role->value,
                        'roleLabel' => $user->role->label(),
                    ]),
            ],
        ]);
    }

    private function filters(): array
    {
        return [
            'departments' => TicketDepartmentResource::collection(
                TicketDepartment::query()
                    ->with('supporters:id,first_name,last_name,mobile,role')
                    ->orderBy('sort_order')
                    ->get()
            )->resolve(),
            'supporters' => User::query()
                ->where('role', UserRole::ADMIN->value)
                ->orderBy('first_name')
                ->get(['id', 'first_name', 'last_name', 'mobile', 'role'])
                ->map(fn (User $user) => [
                    'id' => $user->id,
                    'name' => $user->full_name,
                    'mobile' => $user->mobile,
                    'role' => $user->role->value,
                    'roleLabel' => $user->role->label(),
                ]),
            'statuses' => TicketStatus::options(),
            'priorities' => TicketPriority::options(),
        ];
    }
}
