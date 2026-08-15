<?php

namespace App\Enums;

enum ReactionType: string
{
    case Like = 'like';
    case Dislike = 'dislike';

    public function counterColumn(): string
    {
        return match ($this) {
            self::Like => 'likes_count',
            self::Dislike => 'dislikes_count',
        };
    }
}
