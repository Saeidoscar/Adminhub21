<?php

namespace Tests\Unit;

use Tests\TestCase;

class TestDatabaseSafetyTest extends TestCase
{
    public function test_the_test_suite_uses_an_isolated_in_memory_database(): void
    {
        $this->assertSame('testing', getenv('APP_ENV'));
        $this->assertSame('testing', $_ENV['APP_ENV'] ?? null);
        $this->assertSame('testing', $_SERVER['APP_ENV'] ?? null);
        $this->assertSame('testing', app()->environment());
        $this->assertSame('sqlite', config('database.default'));
        $this->assertSame(':memory:', config('database.connections.sqlite.database'));
    }
}
