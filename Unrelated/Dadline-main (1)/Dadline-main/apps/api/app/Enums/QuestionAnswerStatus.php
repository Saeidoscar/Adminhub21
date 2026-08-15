<?php

namespace App\Enums;

enum QuestionAnswerStatus: string
{
    case Approved = 'approved';
    case Rejected = 'rejected';
}
