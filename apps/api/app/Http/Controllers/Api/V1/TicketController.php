<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Tickets\TicketService;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function __construct(
        private readonly TicketService $ticketService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tickets = Ticket::query()
            ->where('user_id', $request->user()->id)
            ->orWhere('assigned_to', $request->user()->id)
            ->with(['user', 'assignedTo', 'messages'])
            ->paginate();

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

    public function show(Ticket $ticket): JsonResponse
    {
        $ticket->load(['user', 'assignedTo', 'messages.user']);

        return response()->json($ticket);
    }

    public function assign(Request $request, Ticket $ticket): JsonResponse
    {
        $request->validate([
            'assigned_to' => ['required', 'integer', 'exists:users,id'],
        ]);

        $agent = User::query()->findOrFail($request->assigned_to);
        $ticket = $this->ticketService->assign($ticket, $agent);

        return response()->json($ticket);
    }

    public function close(Request $request, Ticket $ticket): JsonResponse
    {
        $ticket = $this->ticketService->close($ticket);

        return response()->json($ticket);
    }

    public function addMessage(Request $request, Ticket $ticket): JsonResponse
    {
        $message = $this->ticketService->addMessage($ticket, $request->user(), $request->validate([
            'body' => ['required', 'string'],
            'is_internal' => ['nullable', 'boolean'],
        ]));

        return response()->json($message, 201);
    }

    public function markRead(Request $request, Ticket $ticket): JsonResponse
    {
        $ticket = $this->ticketService->markRead($ticket, $request->user());

        return response()->json($ticket);
    }
}
