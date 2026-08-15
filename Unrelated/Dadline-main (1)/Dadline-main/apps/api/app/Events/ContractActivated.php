<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

class ContractActivated
{
    use Dispatchable;

    public function __construct(
        public int $contractId
    ) {}
}
