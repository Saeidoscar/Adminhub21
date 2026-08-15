<?php

namespace App\Enums;

enum AiConversationType: string
{
    case LegalQuestion = 'legal_question';
    case DocumentAnalysis = 'document_analysis';
    case CaseResearch = 'case_research';
    case ContractDraft = 'contract_draft';
    case MarketplaceHelp = 'marketplace_help';

    public function label(): string
    {
        return match ($this) {
            self::LegalQuestion => 'Legal Question',
            self::DocumentAnalysis => 'Document Analysis',
            self::CaseResearch => 'Case Research',
            self::ContractDraft => 'Contract Draft',
            self::MarketplaceHelp => 'Marketplace Help',
        };
    }
}
