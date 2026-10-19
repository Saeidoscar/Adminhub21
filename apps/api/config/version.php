<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Application Version
    |--------------------------------------------------------------------------
    |
    | Surfaced by GET /api/v1/health so clients and uptime checks can tell which
    | release they are talking to. Keep it in step with package.json and
    | CHANGELOG.md when cutting a release.
    |
    */

    'current' => env('APP_VERSION', '1.0.0'),
];
