<?php

namespace App\Providers;

use App\Events\ContractSigned;
use App\Events\TicketCreated;
use App\Events\TicketReplied;
use App\Listeners\SendContractNotification;
use App\Listeners\SendTicketNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        TicketCreated::class => [
            SendTicketNotification::class,
        ],
        TicketReplied::class => [
            SendTicketNotification::class,
        ],
        ContractSigned::class => [
            SendContractNotification::class,
        ],
    ];

    public function boot(): void
    {
        //
    }

    public function shouldDiscoverEvents(): bool
    {
        return false;
    }
}
