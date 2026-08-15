<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_health_check(): void
    {
        $response = $this->get('/api/v1/health');

        $response->assertStatus(200)
            ->assertJson(['status' => 'ok', 'version' => 'v1']);
    }
}
