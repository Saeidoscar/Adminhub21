<?php

namespace App\Enums;

enum ProductType: string
{
    case Petition = 'petition';
    case Statement = 'statement';
    case Bill = 'bill';
    case Complaint = 'complaint';
    case Contract = 'contract';
    case Letter = 'letter';
}
