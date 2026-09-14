<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class VerifyPaymentCallback
{
    public function handle(Request $request, Closure $next, string $gateway): Response
    {
        $config = config("payment.callbacks.{$gateway}");

        if (! is_array($config) || ! isset($config['secret']) || trim((string) $config['secret']) === '') {
            abort(403, 'Payment callback authentication is not configured.');
        }

        $allowedIps = $this->allowedIps($config['allowed_ips'] ?? '');
        $sourceIp = $request->ip();

        if ($sourceIp === null || ($allowedIps !== [] && ! in_array($sourceIp, $allowedIps, true))) {
            abort(403, 'Payment callback source is not allowed.');
        }

        $timestampValue = $request->header('X-Payment-Timestamp')
            ?? $request->header('X-Webhook-Timestamp')
            ?? $request->input('timestamp');
        $timestamp = $this->positiveInteger($timestampValue);

        if ($timestamp === null) {
            abort(401, 'Stale payment callback.');
        }

        $tolerance = max(1, (int) ($config['tolerance_seconds'] ?? 300));

        if (abs(time() - $timestamp) > $tolerance) {
            abort(401, 'Stale payment callback.');
        }

        $signatureValue = $request->header('X-Payment-Signature')
            ?? $request->header('X-Webhook-Signature')
            ?? $request->header('X-Signature')
            ?? $request->input('signature');
        $signature = is_string($signatureValue) ? trim($signatureValue) : '';
        $signature = preg_replace('/^(?:sha256=|v1=)/i', '', $signature) ?? '';
        $secret = trim((string) $config['secret']);
        $body = $request->getContent();
        $expected = hash_hmac('sha256', $timestamp . '.' . $body, $secret);

        if ($signature === '' || ! hash_equals($expected, $signature)) {
            abort(401, 'Invalid payment callback signature.');
        }

        $replayKey = 'payment-callback:' . $gateway . ':' . $timestamp . ':' . hash('sha256', $signature);
        $replayTtl = max(1, (int) ($config['replay_ttl_seconds'] ?? max($tolerance, 300)));

        if (! Cache::add($replayKey, true, $replayTtl)) {
            abort(409, 'Payment callback has already been processed.');
        }

        return $next($request);
    }

    private function allowedIps(array|string $value): array
    {
        $values = is_array($value) ? $value : explode(',', $value);

        return array_values(array_unique(array_filter(array_map(
            'trim',
            $values,
        ), static fn (string $ip): bool => $ip !== '')));
    }

    private function positiveInteger(mixed $value): ?int
    {
        if (! is_string($value) && ! is_int($value)) {
            return null;
        }

        $value = trim((string) $value);

        if (! ctype_digit($value) || $value === '0') {
            return null;
        }

        return (int) $value;
    }
}
