<?php

namespace App\Enums;

enum WalletTransactionType: string
{
    case OnlineCharge = 'online_charge';
    case ContractPayment = 'contract_payment';
    case ProposalCost = 'proposal_cost';
    case PlatformFee = 'platform_fee';
    case HandlingIncome = 'handling_income';
    case HandlingCost = 'handling_cost';
    case AiTokenPurchase = 'ai_token_purchase';
    case AffiliateCommission = 'affiliate_commission';
    case Refund = 'refund';
    case Withdrawal = 'withdrawal';
    case Deposit = 'deposit';
    case Transfer = 'transfer';

    public function label(): string
    {
        return match ($this) {
            self::OnlineCharge => 'Wallet Charge',
            self::ContractPayment => 'Contract Payment',
            self::ProposalCost => 'Proposal Cost',
            self::PlatformFee => 'Platform Fee',
            self::HandlingIncome => 'Case Handling Income',
            self::HandlingCost => 'Case Handling Cost',
            self::AiTokenPurchase => 'AI Token Purchase',
            self::AffiliateCommission => 'Affiliate Commission',
            self::Refund => 'Refund',
            self::Withdrawal => 'Withdrawal',
            self::Deposit => 'Deposit',
            self::Transfer => 'Transfer',
        };
    }

    public static function labelFor(?string $value): string
    {
        return self::tryFrom((string) $value)?->label() ?? 'Unknown';
    }
}
