<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'admin_panel' => [
        'key' => env('ADMIN_PANEL_API_KEY'),
    ],

    'payment' => [
        'callback_base_url' => env('PAYMENT_CALLBACK_BASE_URL', 'https://api.dadline.net'),
        'return_url' => env('PAYMENT_RETURN_URL'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'notifications' => [
        'sms_providers' => [
            'meli_payamak',
            'adl_payamak',
        ],
        'telegram' => [
            'token' => env('TELEGRAM_BOT_TOKEN'),
            'proxy' => env('TELEGRAM_PROXY_URL'),
        ],
        'bale' => [
            'token' => env('BALE_BOT_TOKEN'),
        ],
        'eitaa' => [
            'token' => env('EITAA_BOT_TOKEN'),
        ],
        'push' => [
            'provider' => env('PUSH_PROVIDER', 'fcm'),
            'fcm_credentials' => env('FCM_CREDENTIALS'),
        ],
        'call' => [
            'provider' => env('OTP_CALL_PROVIDER', 'meli_payamak'),
        ],
    ],

];
