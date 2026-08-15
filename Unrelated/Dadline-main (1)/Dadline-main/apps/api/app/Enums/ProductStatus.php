<?php

namespace App\Enums;

enum ProductStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case Published = 'published';
    case Rejected = 'rejected';
    case Paused = 'paused';
    case Archived = 'archived';
}
