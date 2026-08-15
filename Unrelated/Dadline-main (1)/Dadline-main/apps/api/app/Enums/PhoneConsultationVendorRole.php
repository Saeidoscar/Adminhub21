<?php

namespace App\Enums;

enum PhoneConsultationVendorRole: string
{
    case EXPERT = 'expert';
    case LAWYER = 'lawyer';
    case VIP = 'vip';
}
