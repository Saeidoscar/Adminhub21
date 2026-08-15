<?php

namespace App\Enums;

enum WalletTransactionDirection: string
{
    case Deposit = 'deposit';
    case Withdrawal = 'withdrawal';

    public function label(): string
    {
        return match ($this) {
            self::Deposit => 'واریز',
            self::Withdrawal => 'برداشت',
        };
    }
}
