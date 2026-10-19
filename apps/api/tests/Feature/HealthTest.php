<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    public function test_health_reports_the_release_version(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertJsonPath('status', 'ok')
            ->assertJsonPath('api', 'v1')
            ->assertJsonPath('version', config('version.current'));
    }

    public function test_the_release_version_is_not_empty(): void
    {
        $this->assertMatchesRegularExpression('/^\d+\.\d+\.\d+$/', config('version.current'));
    }
}
