<?php

return [

    'callbacks' => [
        'zibal' => [
            'secret' => env('ZIBAL_CALLBACK_SECRET'),
            'allowed_ips' => env('ZIBAL_CALLBACK_ALLOWED_IPS', ''),
            'tolerance_seconds' => (int) env('ZIBAL_CALLBACK_TOLERANCE_SECONDS', 300),
            'replay_ttl_seconds' => (int) env('ZIBAL_CALLBACK_REPLAY_TTL_SECONDS', 300),
        ],

        'sep' => [
            'secret' => env('SEP_CALLBACK_SECRET'),
            'allowed_ips' => env('SEP_CALLBACK_ALLOWED_IPS', ''),
            'tolerance_seconds' => (int) env('SEP_CALLBACK_TOLERANCE_SECONDS', 300),
            'replay_ttl_seconds' => (int) env('SEP_CALLBACK_REPLAY_TTL_SECONDS', 300),
        ],

        'crypto' => [
            'secret' => env('CRYPTO_CALLBACK_SECRET'),
            'allowed_ips' => env('CRYPTO_CALLBACK_ALLOWED_IPS', ''),
            'tolerance_seconds' => (int) env('CRYPTO_CALLBACK_TOLERANCE_SECONDS', 300),
            'replay_ttl_seconds' => (int) env('CRYPTO_CALLBACK_REPLAY_TTL_SECONDS', 300),
        ],
    ],

];
