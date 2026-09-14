<?php

return [

    'driver' => env('HASH_DRIVER', 'argon2id'),

    'bcrypt' => [
        'rounds' => env('BCRYPT_ROUNDS', 12),
    ],

    'argon2id' => [
        'memory' => env('ARGON2ID_MEMORY', 65536),
        'threads' => env('ARGON2ID_THREADS', 4),
        'time' => env('ARGON2ID_TIME', 4),
    ],

];
