<?php

namespace App\Enums;

enum DodbotConversationType: int
{
    case LegalQuestion = 1;
    case MultipleChoice = 2;
    case LawSearch = 3;
    case ContractDraft = 4;
    case PredictingCase = 5;
    case DocumentDraft = 6;
    case VerdictAnalysis = 7;
    case GeneralLegal = 8;

    public function label(): string
    {
        return match ($this) {
            self::LegalQuestion => 'پرسش حقوقی',
            self::MultipleChoice => 'چندگزینه‌ای',
            self::LawSearch => 'جستجوی قانون',
            self::ContractDraft => 'پیش‌نویس قرارداد',
            self::PredictingCase => 'پیش‌بینی پرونده',
            self::DocumentDraft => 'پیش‌نویس سند',
            self::VerdictAnalysis => 'تحلیل رأی',
            self::GeneralLegal => 'حقوقی عمومی',
        };
    }

    public static function fromLegacy(?string $value): self
    {
        return match (strtolower(trim($value ?? ''))) {
            'legal_question' => self::LegalQuestion,
            'mcq' => self::MultipleChoice,
            'law_search' => self::LawSearch,
            'contract_draft' => self::ContractDraft,
            'predicting_case' => self::PredictingCase,
            'document_draft' => self::DocumentDraft,
            'analysis_verdict' => self::VerdictAnalysis,
            'legal' => self::GeneralLegal,
            default => self::LegalQuestion,
        };
    }
}
