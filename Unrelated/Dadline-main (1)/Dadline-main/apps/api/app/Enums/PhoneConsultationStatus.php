<?php

namespace App\Enums;

enum PhoneConsultationStatus: string
{
    case SUBMITTED = 'submitted';
    case CALLING = 'calling';
    case ANSWERED = 'answered';
    case CANCELED = 'canceled';
}
