<?php

namespace App\Http\Controllers\Api\V1;

use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Enums\TicketStatus;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Ticket::query()->with(['user', 'assignedTo']);

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        if ($priority = $request->string('priority')->toString()) {
            $query->where('priority', $priority);
        }

        if ($search = $request->string('search')->toString()) {
            $query->where('subject', 'like', "%{$search}%");
        }

        $tickets = $query->paginate();

        return response()->json(['tickets' => $tickets->items()], 200, ['X-Total-Count' => $tickets->total()]);
    }

    public function show(Ticket $ticket): JsonResponse
    {
        $this->authorize('manage', $ticket);

        $ticket->load(['user', 'assignedTo', 'messages.user']);

        return response()->json(['ticket' => $ticket]);
    }

    public function update(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('manage', $ticket);

        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:open,in_progress,resolved,closed'],
            'priority' => ['nullable', 'string', 'in:low,normal,high,urgent'],
            'assigned_to' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $ticket->update($validated);

        return response()->json(['ticket' => $ticket->load(['user', 'assignedTo', 'messages.user'])]);
    }

    public function assign(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('manage', $ticket);

        $request->validate([
            'assigned_to' => ['required', 'integer', 'exists:users,id'],
        ]);

        $agent = User::query()->findOrFail($request->assigned_to);
        $ticket->update(['assigned_to' => $agent->id]);

        return response()->json(['ticket' => $ticket->load(['user', 'assignedTo', 'messages.user'])]);
    }

    public function close(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('manage', $ticket);

        $ticket->update(['status' => TicketStatus::Closed->value]);

        return response()->json(['ticket' => $ticket->load(['user', 'assignedTo', 'messages.user'])]);
    }

    public function reply(Request $request, Ticket $ticket): JsonResponse
    {
        $this->authorize('manage', $ticket);

        $validated = $request->validate([
            'body' => ['required', 'string'],
            'is_internal' => ['nullable', 'boolean'],
        ]);

        $message = TicketMessage::query()->create([
            'ticket_id' => $ticket->id,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'is_internal' => $validated['is_internal'] ?? false,
        ]);

        return response()->json(['message' => $message], 201);
    }
}
