<?php

namespace App\Enums;

enum PurchaseIntentStatus: string
{
    case PendingWallet = 'pending_wallet';
    case PendingGateway = 'pending_gateway';
    case Paid = 'paid';
    case Completed = 'completed';
    case Failed = 'failed';
    case Cancelled = 'cancelled';
}
