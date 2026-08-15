<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPanelRequest
{
    private const SIGNATURE_TTL_SECONDS = 60;

    private const NONCE_HEX_LENGTH = 32;

    public function handle(Request $request, Closure $next): Response
    {
        $secret = (string) config('services.admin_panel.key', '');

        if (strlen($secret) < 32) {
            return response()->json([
                'message' => 'Admin panel API is not configured.',
            ], 503);
        }

        $timestamp = (string) $request->header('X-Dadline-Admin-Timestamp', '');
        $nonce = (string) $request->header('X-Dadline-Admin-Nonce', '');
        $providedSignature = (string) $request->header('X-Dadline-Admin-Signature', '');

        if (
            ! ctype_digit($timestamp)
            || ! preg_match('/^[a-f0-9]{'.self::NONCE_HEX_LENGTH.'}$/', $nonce)
            || ! preg_match('/^[a-f0-9]{64}$/', $providedSignature)
        ) {
            abort(404);
        }

        if (abs(now()->timestamp - (int) $timestamp) > self::SIGNATURE_TTL_SECONDS) {
            abort(404);
        }

        $payload = implode("\n", [
            strtoupper($request->getMethod()),
            $request->getRequestUri(),
            hash('sha256', $request->getContent()),
            $timestamp,
            $nonce,
        ]);

        $expectedSignature = hash_hmac('sha256', $payload, $secret);

        if (! hash_equals($expectedSignature, $providedSignature)) {
            abort(404);
        }

        $replayKey = 'admin-panel-request:'.hash('sha256', $providedSignature);
        if (! Cache::add($replayKey, true, self::SIGNATURE_TTL_SECONDS)) {
            abort(404);
        }

        return $next($request);
    }
}
