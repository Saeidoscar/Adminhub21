<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

class ContractCompleted
{
    use Dispatchable;

    public function __construct(
        public int $contractId
    ) {}
}
