<?php

namespace App\Services\Tickets;

use App\Models\Ticket;
use App\Models\User;
use App\Actions\Tickets\CreateTicketAction;
use App\Actions\Tickets\AssignTicketAction;
use App\Actions\Tickets\CloseTicketAction;
use App\Actions\Tickets\AddTicketMessageAction;
use App\Actions\Tickets\MarkTicketReadAction;

class TicketService
{
    public function __construct(
        private readonly CreateTicketAction $create,
        private readonly AssignTicketAction $assign,
        private readonly CloseTicketAction $close,
        private readonly AddTicketMessageAction $addMessage,
        private readonly MarkTicketReadAction $markRead,
    ) {}

    public function create(User $sender, array $data): Ticket
    {
        return $this->create->execute($sender, $data);
    }

    public function assign(Ticket $ticket, User $agent): Ticket
    {
        return $this->assign->execute($ticket, $agent);
    }

    public function close(Ticket $ticket): Ticket
    {
        return $this->close->execute($ticket);
    }

    public function addMessage(Ticket $ticket, User $user, array $data): \App\Models\TicketMessage
    {
        return $this->addMessage->execute($ticket, $user, $data);
    }

    public function markRead(Ticket $ticket, User $user): Ticket
    {
        return $this->markRead->execute($ticket, $user);
    }
}
