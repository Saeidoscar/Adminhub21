<?php

use Illuminate\Support\Str;

return [

    'path' => 'horizon',

    'use' => 'default',

    'prefix' => env(
        'HORIZON_PREFIX',
        Str::slug(env('APP_NAME', 'laravel'), '_').'_horizon:'
    ),

    'domain' => env('HORIZON_DOMAIN'),

    'middleware' => ['api', 'auth:sanctum'],

    'waits' => [
        'redis:default' => 60,
    ],

    'trim' => [
        'recent' => 60,
        'pending' => 60,
        'completed' => 60,
        'recent_failed' => 10080,
        'failed' => 10080,
        'monitored' => 10080,
    ],

    'silenced' => [
        \Laravel\Horizon\Silenced::class,
    ],

    'metrics' => [
        'trim_snapshots' => [
            'job' => 24,
            'queue' => 24,
        ],
    ],

    'fast_termination' => false,

    'memory_limit' => 64,

    'defaults' => [
        'ai-queue' => [
            'connection' => 'redis',
            'queue' => ['ai-default', 'ai-priority'],
            'balance' => 'auto',
            'autoScalingStrategy' => 'time',
            'maxTime' => 0,
            'maxJobs' => 0,
            'memory' => 128,
            'tries' => 3,
            'timeout' => 120,
            'nice' => 0,
        ],
        'pdf-queue' => [
            'connection' => 'redis',
            'queue' => ['pdf-default'],
            'balance' => 'simple',
            'autoScalingStrategy' => 'size',
            'maxTime' => 0,
            'maxJobs' => 0,
            'memory' => 256,
            'tries' => 2,
            'timeout' => 300,
            'nice' => 0,
        ],
        'notifications-queue' => [
            'connection' => 'redis',
            'queue' => ['notifications-default', 'notifications-broadcast'],
            'balance' => 'simple',
            'autoScalingStrategy' => 'size',
            'maxTime' => 0,
            'maxJobs' => 0,
            'memory' => 128,
            'tries' => 3,
            'timeout' => 60,
            'nice' => 0,
        ],
    ],

    'environments' => [
        'production' => [
            'ai-queue' => [
                'maxProcesses' => 10,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
            'pdf-queue' => [
                'maxProcesses' => 5,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
            'notifications-queue' => [
                'maxProcesses' => 5,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
        ],
        'staging' => [
            'ai-queue' => [
                'maxProcesses' => 3,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
            'pdf-queue' => [
                'maxProcesses' => 2,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
            'notifications-queue' => [
                'maxProcesses' => 2,
                'balanceMaxShift' => 1,
                'balanceCooldown' => 3,
            ],
        ],
        'local' => [
            'ai-queue' => [
                'maxProcesses' => 2,
            ],
            'pdf-queue' => [
                'maxProcesses' => 1,
            ],
            'notifications-queue' => [
                'maxProcesses' => 1,
            ],
        ],
    ],
];
