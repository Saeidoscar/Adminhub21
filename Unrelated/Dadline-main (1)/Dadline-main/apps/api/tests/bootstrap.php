<?php

require dirname(__DIR__).'/vendor/autoload.php';

$expectedEnvironment = [
    'APP_ENV' => 'testing',
    'APP_CONFIG_CACHE' => 'bootstrap/cache/config.testing.php',
    'DB_CONNECTION' => 'sqlite',
    'DB_DATABASE' => ':memory:',
];

foreach ($expectedEnvironment as $name => $expectedValue) {
    $actualValues = [
        'getenv' => getenv($name) ?: null,
        '_ENV' => $_ENV[$name] ?? null,
        '_SERVER' => $_SERVER[$name] ?? null,
    ];

    foreach ($actualValues as $source => $actualValue) {
        if ($actualValue !== $expectedValue) {
            throw new RuntimeException(sprintf(
                'Unsafe test environment: %s[%s] must be %s, got %s.',
                $source,
                $name,
                $expectedValue,
                $actualValue ?? '<unset>',
            ));
        }
    }
}
