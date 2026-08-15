<?php

namespace App\Http\Controllers\Api\Tickets;

use App\Actions\Tickets\CreateTicketAction;
use App\Actions\Tickets\UpdateTicketAction;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tickets\StoreTicketRequest;
use App\Http\Requests\Tickets\TicketIndexRequest;
use App\Http\Requests\Tickets\UpdateTicketStatusRequest;
use App\Http\Resources\Tickets\TicketDepartmentResource;
use App\Http\Resources\Tickets\TicketResource;
use App\Models\Ticket;
use App\Models\TicketDepartment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class TicketController extends Controller
{
    public function index(TicketIndexRequest $request): AnonymousResourceCollection
    {
        $this->authorize('viewAny', Ticket::class);
        $user = $request->user();

        $tickets = Ticket::query()
            ->where(function ($query) use ($user): void {
                $query->where('sender_id', $user->id)
                    ->orWhere('provider_id', $user->id);
            })
            ->with([
                'department',
                'sender.profile.avatar',
                'assignedTo.profile.avatar',
                'provider.profile.avatar',
                'latestPublicMessage.ticket',
                'latestPublicMessage.user.profile.avatar',
                'latestPublicMessage.attachment',
            ])
            ->when($request->validated('q'), function ($query, string $q): void {
                $query->where(function ($query) use ($q): void {
                    $query->where('title', 'like', "%{$q}%")
                        ->orWhere('uuid', 'like', "%{$q}%")
                        ->orWhereHas('messages', fn ($query) => $query
                            ->where('is_internal', false)
                            ->where('body', 'like', "%{$q}%"));
                });
            })
            ->when($request->validated('status'), fn ($query, string $status) => $query->where('status', $status))
            ->when($request->validated('priority'), fn ($query, string $priority) => $query->where('priority', $priority))
            ->when($request->validated('department'), fn ($query, string $department) => $query->whereHas(
                'department',
                fn ($query) => $query->where('slug', $department),
            ))
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->paginate($request->integer('per_page', 15));

        return TicketResource::collection($tickets);
    }

    public function store(StoreTicketRequest $request, CreateTicketAction $action): JsonResponse
    {
        $this->authorize('create', Ticket::class);

        $ticket = $action->execute($request->user(), [
            ...$request->safe()->except('file'),
            'file' => $request->file('file'),
        ]);

        return (new TicketResource($ticket))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Ticket $ticket): TicketResource
    {
        $this->authorize('view', $ticket);

        $ticket->markReadBy(request()->user());
        $ticket->load([
            'department',
            'sender.profile.avatar',
            'assignedTo.profile.avatar',
            'provider.profile.avatar',
            'messages' => fn ($query) => $query->where('is_internal', false)->oldest('id'),
            'messages.ticket',
            'messages.user.profile.avatar',
            'messages.attachment',
        ]);

        return new TicketResource($ticket);
    }

    public function updateStatus(
        UpdateTicketStatusRequest $request,
        Ticket $ticket,
        UpdateTicketAction $action,
    ): TicketResource {
        $this->authorize('changeStatus', $ticket);

        $updated = $action->execute($ticket, $request->user(), $request->validated());
        $updated->markReadBy($request->user());

        return new TicketResource($updated);
    }

    public function meta(): JsonResponse
    {
        return response()->json([
            'data' => [
                'departments' => TicketDepartmentResource::collection(
                    TicketDepartment::query()
                        ->where('is_active', true)
                        ->orderBy('sort_order')
                        ->get()
                ),
                'priorities' => TicketPriority::options(),
                'statuses' => TicketStatus::options(),
                'defaults' => [
                    'priority' => TicketPriority::Normal->value,
                    'department' => TicketDepartment::query()
                        ->where('is_active', true)
                        ->where('is_default', true)
                        ->value('slug') ?? 'support',
                ],
            ],
        ]);
    }
}
