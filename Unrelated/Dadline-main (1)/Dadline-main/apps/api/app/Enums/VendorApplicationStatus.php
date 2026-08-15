<?php

namespace App\Enums;

enum VendorApplicationStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
}
