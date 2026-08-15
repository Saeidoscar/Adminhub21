<?php

namespace App\Actions\ShortLinks;

use App\Models\ShortLink;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class ResolveShortLinkAction
{
    public function execute(string $shortCode): string
    {
        $shortLink = ShortLink::query()
            ->where('short_code', $shortCode)
            ->firstOrFail();

        $originalUrl = $shortLink->original_url;
        $isInternalPath = str_starts_with($originalUrl, '/')
            && ! str_starts_with($originalUrl, '//');
        $scheme = strtolower((string) parse_url($originalUrl, PHP_URL_SCHEME));

        if (! $isInternalPath && ! in_array($scheme, ['http', 'https'], true)) {
            throw (new ModelNotFoundException)->setModel(
                ShortLink::class,
                [$shortCode]
            );
        }

        ShortLink::query()
            ->whereKey($shortLink->getKey())
            ->increment('clicks');

        return $originalUrl;
    }
}
