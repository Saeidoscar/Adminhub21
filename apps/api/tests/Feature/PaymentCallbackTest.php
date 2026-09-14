<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Cache;
use Tests\TestCase;

class PaymentCallbackTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config([
            'payment.callbacks.zibal' => [
                'secret' => 'callback-secret',
                'allowed_ips' => '',
                'tolerance_seconds' => 300,
                'replay_ttl_seconds' => 300,
            ],
        ]);
        Cache::clear();
    }

    public function test_payment_callback_requires_a_valid_signature(): void
    {
        $body = '{"status":"success"}';
        $timestamp = time();
        $headers = $this->callbackHeaders($body, $timestamp, 'invalid-signature');

        $this->call('POST', '/api/v1/payments/zibal/callback', [], [], [], $headers, $body)
            ->assertUnauthorized();
    }

    public function test_payment_callback_rejects_stale_requests(): void
    {
        $body = '{"status":"success"}';
        $timestamp = time() - 301;
        $signature = hash_hmac('sha256', $timestamp . '.' . $body, 'callback-secret');

        $this->call('POST', '/api/v1/payments/zibal/callback', [], [], [], $this->callbackHeaders($body, $timestamp, $signature), $body)
            ->assertUnauthorized();
    }

    public function test_payment_callback_rejects_replays(): void
    {
        $body = '{"status":"success"}';
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp . '.' . $body, 'callback-secret');
        $headers = $this->callbackHeaders($body, $timestamp, $signature);

        $this->call('POST', '/api/v1/payments/zibal/callback', [], [], [], $headers, $body)
            ->assertOk();
        $this->call('POST', '/api/v1/payments/zibal/callback', [], [], [], $headers, $body)
            ->assertConflict();
    }

    public function test_payment_callback_is_disabled_without_a_secret(): void
    {
        config(['payment.callbacks.zibal.secret' => null]);

        $body = '{"status":"success"}';
        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp . '.' . $body, 'callback-secret');

        $this->call('POST', '/api/v1/payments/zibal/callback', [], [], [], $this->callbackHeaders($body, $timestamp, $signature), $body)
            ->assertForbidden();
    }

    private function callbackHeaders(string $body, int $timestamp, string $signature): array
    {
        return [
            'Content-Type' => 'application/json',
            'X-Payment-Timestamp' => (string) $timestamp,
            'X-Payment-Signature' => $signature,
        ];
    }
}
