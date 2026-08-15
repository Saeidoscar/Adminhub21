<?php

namespace App\Enums;

enum ConversationSubjectType: string
{
    case Service = 'service';
    case Subscription = 'subscription';

    public function label(): string
    {
        return match ($this) {
            self::Service => 'درخواست خدمت',
            self::Subscription => 'اشتراک مشاوره',
        };
    }
}
