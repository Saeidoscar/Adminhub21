<?php

namespace App\Enums;

enum WalletTransactionType: string
{
    case OnlineCharge = 'online_charge';
    case SubmitCase = 'submit_case';
    case HandlingCaseIncome = 'handling_case_income';
    case HandlingCaseCost = 'handling_case_cost';
    case GiftCard = 'gift_card';
    case VerifyCost = 'verify_cost';
    case ContractCost = 'contract_cost';
    case FeeDifference = 'fee_difference';
    case BuyDadcoin = 'buy_dadcoin';
    case SellDadcoin = 'sell_dadcoin';
    case SubmitQuestion = 'submit_question';
    case SubmitVendorRequest = 'submit_vendor_req';
    case HandlingDocCost = 'handling_doc_cost';
    case SubmitLegalDocCost = 'submit_legal_doc_cost';
    case SubmitCounselingPhone = 'submit_counseling_phone';
    case HandlingDocIncome = 'handling_doc_income';
    case DepositIncome = 'deposit_income';
    case SellDocument = 'sell_document';
    case BuyDocument = 'buy_document';
    case HandlingLawlinkCost = 'handling_lawlink_cost';
    case SubmitLawlink = 'submit_lawlink';
    case Marketing = 'marketing';
    case BuyAiToken = 'buy_ai_token';
    case SubmitAnswerOnQuestion = 'submit_answer_on_question';
    case PremiumBuy = 'premium_buy';
    case SmsCharge = 'sms_charge';
    case CancelService = 'cancel_service';
    case ContractAi = 'contract_ai';

    public function label(): string
    {
        return match ($this) {
            self::OnlineCharge => 'شارژ کیف پول',
            self::SubmitCase => 'هزینه ثبت پرونده',
            self::HandlingCaseIncome => 'درآمد رسیدگی پرونده',
            self::HandlingCaseCost => 'هزینه رسیدگی پرونده',
            self::GiftCard => 'کارت هدیه',
            self::VerifyCost => 'هزینه احرازهویت',
            self::ContractCost => 'هزینه ثبت قرارداد',
            self::FeeDifference => 'اختلاف کارمزد تسویه',
            self::BuyDadcoin => 'خرید شارژ دادکوین',
            self::SellDadcoin => 'فروش شارژ دادکوین',
            self::SubmitQuestion => 'هزینه ثبت سوال',
            self::SubmitVendorRequest => 'استعلام و بررسی مدارک',
            self::HandlingDocCost => 'هزینه تنظیم مستند',
            self::SubmitLegalDocCost => 'هزینه ثبت مستند',
            self::SubmitCounselingPhone => 'هزینه مشاوره تلفنی',
            self::HandlingDocIncome => 'درآمد تنظیم مستند',
            self::DepositIncome => 'ثبت تسویه حساب',
            self::SellDocument => 'فروش محصول',
            self::BuyDocument => 'خرید محصول',
            self::HandlingLawlinkCost => 'انجام درخواست همکاری',
            self::SubmitLawlink => 'ثبت درخواست همکاری',
            self::Marketing => 'همکاری در فروش',
            self::BuyAiToken => 'شارژ توکن دادبات',
            self::SubmitAnswerOnQuestion => 'ثبت پاسخ سوال',
            self::PremiumBuy => 'خرید اشتراک ویژه',
            self::SmsCharge => 'خرید بسته پیامکی',
            self::CancelService => 'لغو خدمت',
            self::ContractAi => 'تحلیل قرارداد',
        };
    }

    public static function labelFor(?string $value): string
    {
        return self::tryFrom((string) $value)?->label() ?? 'نامشخص';
    }
}
