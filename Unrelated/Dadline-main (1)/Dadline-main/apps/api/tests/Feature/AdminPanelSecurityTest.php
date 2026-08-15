<?php

namespace Tests\Feature;

use App\Models\Option;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminPanelSecurityTest extends TestCase
{
    use RefreshDatabase;

    private const PANEL_KEY = 'test-admin-panel-key-32-bytes-minimum-value';

    protected function setUp(): void
    {
        parent::setUp();

        config()->set('services.admin_panel.key', self::PANEL_KEY);
        $this->withoutMiddleware(ThrottleRequests::class);
    }

    public function test_admin_login_is_hidden_without_a_valid_panel_signature(): void
    {
        $this->postJson('/v1/admin/auth/login', [
            'identifier' => 'admin@example.test',
            'password' => 'password',
        ])->assertNotFound();
    }

    public function test_expired_panel_signature_is_rejected(): void
    {
        $payload = $this->loginPayload();

        $this->withHeaders($this->signatureHeaders(
            'POST',
            '/v1/admin/auth/login',
            $payload,
            now()->subMinutes(2)->timestamp,
        ))->postJson('/v1/admin/auth/login', $payload)
            ->assertNotFound();
    }

    public function test_tampering_with_a_signed_request_body_is_rejected(): void
    {
        $signedPayload = $this->loginPayload();
        $tamperedPayload = [
            ...$signedPayload,
            'password' => 'different-password',
        ];

        $this->withHeaders($this->signatureHeaders(
            'POST',
            '/v1/admin/auth/login',
            $signedPayload,
        ))->postJson('/v1/admin/auth/login', $tamperedPayload)
            ->assertNotFound();
    }

    public function test_signed_request_cannot_be_replayed(): void
    {
        $payload = $this->loginPayload();
        $nonce = bin2hex(random_bytes(16));
        $headers = $this->signatureHeaders(
            'POST',
            '/v1/admin/auth/login',
            $payload,
            null,
            $nonce,
        );

        $this->withHeaders($headers)
            ->postJson('/v1/admin/auth/login', $payload)
            ->assertUnprocessable();

        $this->withHeaders($headers)
            ->postJson('/v1/admin/auth/login', $payload)
            ->assertNotFound();
    }

    public function test_non_admin_cannot_receive_an_admin_panel_token(): void
    {
        $this->createUser('user');
        $payload = $this->loginPayload();

        $this->withHeaders($this->signatureHeaders('POST', '/v1/admin/auth/login', $payload))
            ->postJson('/v1/admin/auth/login', $payload)
            ->assertUnprocessable();
    }

    public function test_admin_token_is_scoped_and_can_access_dashboard(): void
    {
        $this->createUser('admin');
        $token = $this->adminToken();

        $this->signedJson('GET', '/v1/admin/dashboard', [], $token)
            ->assertOk()
            ->assertJsonStructure(['data' => ['summary', 'financialTrend', 'recentUsers', 'recentTransactions']]);
    }

    public function test_regular_sanctum_token_cannot_access_admin_endpoints(): void
    {
        $admin = $this->createUser('admin');
        $token = $admin->createToken('auth-token')->plainTextToken;

        $this->signedJson('GET', '/v1/admin/dashboard', [], $token)
            ->assertForbidden();
    }

    public function test_admin_report_endpoints_return_the_expected_contracts(): void
    {
        $this->createUser('admin');
        $token = $this->adminToken();

        $this->signedJson('GET', '/v1/admin/users', [], $token)
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'filters' => ['roles']]);

        $this->signedJson('GET', '/v1/admin/wallet-transactions', [], $token)
            ->assertOk()
            ->assertJsonStructure(['data', 'summary', 'meta', 'filters']);

        $this->signedJson('GET', '/v1/admin/financials', [], $token)
            ->assertOk()
            ->assertJsonStructure(['data', 'summary', 'meta', 'filters']);

        $this->signedJson('GET', '/v1/admin/operations', [], $token)
            ->assertOk()
            ->assertJsonStructure(['data' => [
                'counts',
                'vendorApplications',
                'tickets',
                'contracts',
                'orders',
                'serviceRequests',
                'consultations',
                'externalServices',
            ]]);


        $this->signedJson('GET', '/v1/admin/tickets/meta', [], $token)
            ->assertOk()
            ->assertJsonStructure(['data' => ['departments', 'supporters', 'statuses', 'priorities', 'providers']]);

        $this->signedJson('GET', '/v1/admin/tickets', [], $token)
            ->assertOk()
            ->assertJsonStructure(['data', 'meta', 'filters']);

        $this->signedJson('GET', '/v1/admin/ticket-departments', [], $token)
            ->assertOk()
            ->assertJsonStructure(['data']);
    }

    public function test_sensitive_options_are_masked_and_blank_updates_preserve_the_secret(): void
    {
        $this->createUser('admin');
        $token = $this->adminToken();
        $option = Option::set(
            'api_ir_api_key',
            'super-secret-value',
            'external_services',
        );

        $uri = '/v1/admin/options?q=api_ir_api_key';
        $this->signedJson('GET', $uri, [], $token)
            ->assertOk()
            ->assertJsonPath('data.0.key', 'api_ir_api_key')
            ->assertJsonPath('data.0.value', null)
            ->assertJsonPath('data.0.isSensitive', true)
            ->assertJsonPath('data.0.hasValue', true)
            ->assertJsonStructure(['data', 'groups', 'meta']);

        $payload = [
            'value' => '',
            'group' => 'external_services',
            'autoload' => false,
        ];
        $this->signedJson('PATCH', "/v1/admin/options/{$option->id}", $payload, $token)
            ->assertOk()
            ->assertJsonPath('data.value', null);

        $this->assertSame(
            'super-secret-value',
            Option::query()->findOrFail($option->id)->value,
        );
    }

    private function signedJson(
        string $method,
        string $uri,
        array $body = [],
        ?string $token = null,
    ) {
        $headers = $this->signatureHeaders($method, $uri, $body);

        if ($token !== null) {
            $headers['Authorization'] = "Bearer {$token}";
        }

        if (strtoupper($method) === 'GET') {
            return $this->withHeaders([
                ...$headers,
                'Accept' => 'application/json',
            ])->get($uri);
        }

        return $this->withHeaders($headers)->json($method, $uri, $body);
    }

    private function adminToken(): string
    {
        $payload = $this->loginPayload();

        return $this->withHeaders($this->signatureHeaders('POST', '/v1/admin/auth/login', $payload))
            ->postJson('/v1/admin/auth/login', $payload)
            ->assertOk()
            ->assertJsonPath('data.user.role', 'admin')
            ->json('data.token');
    }

    /**
     * @param  array<string, mixed>  $body
     * @return array<string, string>
     */
    private function signatureHeaders(
        string $method,
        string $uri,
        array $body = [],
        ?int $timestamp = null,
        ?string $nonce = null,
    ): array {
        $timestamp ??= now()->timestamp;
        $nonce ??= bin2hex(random_bytes(16));
        $rawBody = $body === [] ? '' : json_encode($body);
        $payload = implode("\n", [
            strtoupper($method),
            $uri,
            hash('sha256', $rawBody),
            (string) $timestamp,
            $nonce,
        ]);

        return [
            'X-Dadline-Admin-Timestamp' => (string) $timestamp,
            'X-Dadline-Admin-Nonce' => $nonce,
            'X-Dadline-Admin-Signature' => hash_hmac('sha256', $payload, self::PANEL_KEY),
        ];
    }

    /**
     * @return array{identifier: string, password: string}
     */
    private function loginPayload(): array
    {
        return [
            'identifier' => '09123456789',
            'password' => 'password',
        ];
    }

    private function createUser(string $role): User
    {
        return User::query()->create([
            'first_name' => 'Farhad',
            'last_name' => 'Admin',
            'mobile' => '09123456789',
            'email' => 'admin@example.test',
            'password' => Hash::make('password'),
            'role' => $role,
        ]);
    }
}
