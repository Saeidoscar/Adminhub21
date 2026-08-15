<?php

namespace Tests\Feature;

use App\Jobs\Auth\SendOtpCallJob;
use App\Jobs\Auth\SendOtpSmsJob;
use App\Models\Otp;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Routing\Middleware\ThrottleRequests;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_password_login_returns_the_auth_js_user_contract(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);

        User::create([
            'first_name' => 'Ali',
            'last_name' => 'Ahmadi',
            'mobile' => '09123456789',
            'email' => 'ali@example.test',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        $this->postJson('/v1/auth/login', [
            'identifier' => '09123456789',
            'password' => 'password',
        ])->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonStructure([
                'data' => [
                    'token',
                    'user' => ['id', 'firstName', 'lastName', 'mobile', 'email', 'role', 'roles'],
                ],
            ])
            ->assertJsonPath('data.user.roles', ['user']);
    }

    public function test_send_otp_stores_only_a_hash_and_dispatches_an_encrypted_job(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);
        Bus::fake();

        $this->postJson('/v1/auth/otp/send', [
            'mobile' => '09123456789',
            'channel' => 'sms',
        ])->assertOk();

        $otp = Otp::sole();

        $this->assertMatchesRegularExpression('/^\\$2[aby]\\$/', $otp->code);
        Bus::assertDispatched(SendOtpSmsJob::class);
    }

    public function test_call_otp_dispatches_the_encrypted_call_job(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);
        Bus::fake();

        $this->postJson('/v1/auth/otp/send', [
            'mobile' => '09123456789',
            'channel' => 'call',
        ])->assertOk();

        Bus::assertDispatched(SendOtpCallJob::class);
    }

    public function test_valid_otp_returns_the_auth_js_user_contract(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);
        $this->createUserAndOtp('09123456789', '123456');

        $this->postJson('/v1/auth/otp/verify', [
            'mobile' => '09123456789',
            'code' => '123456',
        ])->assertOk()
            ->assertJsonStructure([
                'token',
                'user' => ['id', 'firstName', 'lastName', 'mobile', 'email', 'role', 'roles'],
            ])
            ->assertJsonPath('user.roles', ['user']);

        $this->assertNotNull(Otp::sole()->verified_at);
    }

    public function test_invalid_otp_is_rejected(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);
        $this->createUserAndOtp('09123456789', '123456');

        $this->postJson('/v1/auth/otp/verify', [
            'mobile' => '09123456789',
            'code' => '654321',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('code');

        $this->assertSame(1, Otp::sole()->attempts);
    }

    public function test_expired_otp_is_rejected(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);
        $this->createUserAndOtp('09123456789', '123456', now()->subSecond());

        $this->postJson('/v1/auth/otp/verify', [
            'mobile' => '09123456789',
            'code' => '123456',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('code');
    }

    public function test_otp_send_endpoint_is_rate_limited(): void
    {
        Bus::fake();
        Cache::flush();
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.10']);

        foreach (range(1, 5) as $attempt) {
            $this->postJson('/v1/auth/otp/send', [
                'mobile' => sprintf('0912345%04d', $attempt),
                'channel' => 'sms',
            ])->assertOk();
        }

        $this->postJson('/v1/auth/otp/send', [
            'mobile' => '09123459999',
            'channel' => 'sms',
        ])->assertStatus(429);
    }

    public function test_check_mobile_returns_a_valid_response_for_an_unknown_mobile(): void
    {
        $this->withoutMiddleware(ThrottleRequests::class);

        $this->postJson('/v1/auth/check-mobile', [
            'mobile' => '09123456789',
        ])->assertOk()
            ->assertExactJson([
                'exists' => false,
                'firstName' => null,
            ]);
    }

    private function createUserAndOtp(string $mobile, string $code, $expiresAt = null): void
    {
        User::create([
            'first_name' => 'Ali',
            'last_name' => 'Ahmadi',
            'mobile' => $mobile,
            'email' => 'ali@example.test',
            'password' => Hash::make('password'),
            'role' => 'user',
        ]);

        Otp::create([
            'mobile' => $mobile,
            'code' => Hash::make($code),
            'expires_at' => $expiresAt ?? now()->addMinutes(2),
        ]);
    }
}
