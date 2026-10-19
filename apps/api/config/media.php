<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Media disk
    |--------------------------------------------------------------------------
    |
    | Every user-uploaded asset (avatars, portfolio images, attachments,
    | generated contract PDFs) goes through this disk name instead of a
    | hard-coded `s3` or `public`. Local development keeps the files on the
    | `public` disk; production sets MEDIA_DISK=s3 and MEDIA_URL to the CDN.
    |
    */

    'disk' => env('MEDIA_DISK', 'public'),

    /*
    |--------------------------------------------------------------------------
    | Public media origin
    |--------------------------------------------------------------------------
    |
    | When set, files are served from this origin (a CDN in production) instead
    | of the application host. The `public` and `s3` disks both read it, so a
    | deployment only has to change one variable to move media to a CDN.
    |
    */

    'url' => env('MEDIA_URL'),

];
