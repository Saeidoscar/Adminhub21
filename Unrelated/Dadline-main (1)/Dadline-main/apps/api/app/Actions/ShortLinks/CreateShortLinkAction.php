<?php

namespace App\Actions\ShortLinks;

use App\Models\ShortLink;

class CreateShortLinkAction
{
    public function execute(string $originalUrl): ShortLink
    {
        return ShortLink::findOrCreateForUrl($originalUrl);
    }
}
