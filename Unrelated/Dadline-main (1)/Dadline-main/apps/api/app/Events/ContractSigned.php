<?php

namespace App\Events;

use Illuminate\Foundation\Events\Dispatchable;

class ContractSigned
{
    use Dispatchable;

    public function __construct(
        public int $contractId,
        public int $signatureId
    ) {}
}
