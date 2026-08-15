<?php

namespace App\Http\Controllers\Admin;

use App\Actions\Tickets\ReplyToTicketAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Tickets\StoreTicketMessageRequest;
use App\Http\Resources\Tickets\TicketMessageResource;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;

class TicketMessageController extends Controller
{
    public function store(
        StoreTicketMessageRequest $request,
        Ticket $ticket,
        ReplyToTicketAction $action,
    ): JsonResponse {
        $message = $action->execute($ticket, $request->user(), [
            ...$request->safe()->except('file'),
            'file' => $request->file('file'),
        ]);
        $message->setRelation('ticket', $ticket);

        return (new TicketMessageResource($message))
            ->response()
            ->setStatusCode(201);
    }
}
