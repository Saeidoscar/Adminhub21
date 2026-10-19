<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TicketStatus;
use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\User;
use App\Services\Tickets\TicketService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function __construct(
        private readonly TicketService $ticketService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $tickets = Ticket::query()
            ->where(function ($query) use ($user): void {
                $query->where('user_id', $user->id)
                    ->orWhere('assigned_to', $user->id);
            })
            ->when(
                $request->query('status'),
                fn ($query, string $status) => $query->where('status', $status),
            )
            ->with(['user', 'assignedTo'])
            ->orderByDesc('updated_at')
            ->paginate(min(50, max(1, (int) $request->query('per_page', 20))));

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $ticket = $this->ticketService->create($request->user(), $request->validate([
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'priority' => ['nullable', 'string', 'in:low,medium,high,urgent'],
        ]));

        return response()->json($ticket, 201);
    }

    public function show(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('view', $ticket);

        $ticket->load([
            'user',
            'assignedTo',
            'messages' => fn ($query) => $this->canSeeInternalNotes($request->user())
                ? $query->with('user')->orderBy('created_at')
                : $query->where('is_internal', false)->with('user')->orderBy('created_at'),
        ]);

        return response()->json($ticket);
    }

    /**
     * Staff can post notes the requester must never see.
     */
    private function canSeeInternalNotes(User $user): bool
    {
        return $user->hasRole('admin') || $user->hasRole('super_admin');
    }

    public function update(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('update', $ticket);

        // A ticket's owner may change its status, but reassigning or
        // reprioritising is a support operation.
        $staff = $this->canSeeInternalNotes($request->user());

        $data = $request->validate([
            'status' => ['nullable', 'string', 'in:open,in_progress,resolved,closed'],
            'priority' => $staff
                ? ['nullable', 'string', 'in:low,medium,high,urgent']
                : ['prohibited'],
            'assigned_to' => $staff
                ? ['nullable', 'integer', 'exists:users,id']
                : ['prohibited'],
        ]);

        if (($data['status'] ?? null) === TicketStatus::Resolved->value
            || ($data['status'] ?? null) === TicketStatus::Closed->value) {
            $data['resolved_at'] = now();
        }

        $ticket->update($data);

        return response()->json($ticket->load(['user', 'assignedTo']));
    }

    public function assign(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('manage', $ticket);
        $request->validate([
            'assigned_to' => ['required', 'integer', 'exists:users,id'],
        ]);

        $agent = User::query()->findOrFail($request->assigned_to);
        $ticket = $this->ticketService->assign($ticket, $agent);

        return response()->json($ticket);
    }

    public function close(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('manage', $ticket);
        $ticket = $this->ticketService->close($ticket);

        return response()->json($ticket);
    }

    public function reply(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('manage', $ticket);

        $data = $request->validate([
            'body' => ['required', 'string', 'max:10000'],
            'is_internal' => $this->canSeeInternalNotes($request->user())
                ? ['nullable', 'boolean']
                : ['prohibited'],
        ]);

        $message = $this->ticketService->addMessage($ticket, $request->user(), $data);

        return response()->json($message, 201);
    }

    public function addMessage(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('manage', $ticket);
        $message = $this->ticketService->addMessage($ticket, $request->user(), $request->validate([
            'body' => ['required', 'string'],
            'is_internal' => ['nullable', 'boolean'],
        ]));

        return response()->json($message, 201);
    }

    public function markRead(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('update', $ticket);
        $ticket = $this->ticketService->markRead($ticket, $request->user());

        return response()->json($ticket);
    }
}
