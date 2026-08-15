<?php

namespace App\Enums;

enum EmbeddingSourceType: int
{
    case LawArticle = 1;
    case DocumentProduct = 2;
    case UnificationVerdict = 3;
    case AdvisoryOpinion = 4;
    case Terminology = 5;

    public function key(): string
    {
        return match ($this) {
            self::LawArticle => 'law_article',
            self::DocumentProduct => 'document_product',
            self::UnificationVerdict => 'unification_verdict',
            self::AdvisoryOpinion => 'advisory_opinion',
            self::Terminology => 'terminology',
        };
    }
}
