<?php

namespace App\Enums;

enum AiConversationType: string
{
    case LegalQuestion = 'legal_question';
    case DocumentAnalysis = 'document_analysis';
    case CaseResearch = 'case_research';
    case ContractDraft = 'contract_draft';
    case ContractReview = 'contract_review';
    case MarketplaceHelp = 'marketplace_help';
    case TicketTriage = 'ticket_triage';
    case Moderation = 'moderation';
    case I18nDraft = 'i18n_draft';
    case Reasoning = 'reasoning';

    public function label(): string
    {
        return match ($this) {
            self::LegalQuestion => 'Legal Question',
            self::DocumentAnalysis => 'Document Analysis',
            self::CaseResearch => 'Case Research',
            self::ContractDraft => 'Contract Draft',
            self::ContractReview => 'Contract Review',
            self::MarketplaceHelp => 'Marketplace Help',
            self::TicketTriage => 'Ticket Triage',
            self::Moderation => 'Moderation',
            self::I18nDraft => 'i18n Draft',
            self::Reasoning => 'Reasoning',
        };
    }
}
