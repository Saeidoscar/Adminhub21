<?php

namespace App\Exceptions\Ai;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use RuntimeException;
use Throwable;

/**
 * Every failure raised by the AI provider layer funnels through here so callers
 * (the `analyze` endpoint, `ProcessAiRequest`, the LayerCloud trial guard) get
 * a usable HTTP response instead of a 500, and can tell "misconfigured",
 * "refused by policy" and "upstream said no" apart without parsing strings.
 *
 * Messages never contain the API key.
 */
class AiProviderException extends RuntimeException
{
    public function __construct(
        string $message,
        private readonly int $status = 502,
    ) {
        parent::__construct($message);
    }

    public static function notConfigured(string $provider): self
    {
        return new self("AI provider [{$provider}] is not configured: its API key is empty.", 500);
    }

    /**
     * Raised by the LayerCloud training-circle guard rails: the request was
     * well-formed but policy refuses to send it.
     */
    public static function blocked(string $reason): self
    {
        return new self("LayerCloud trial guard blocked the request: {$reason}", 422);
    }

    public static function upstream(string $provider, int $httpStatus, string $body): self
    {
        $summary = trim((string) preg_replace('/\s+/', ' ', $body));
        $summary = mb_substr($summary, 0, 500);

        return new self(
            "AI provider [{$provider}] returned HTTP {$httpStatus}: {$summary}",
            $httpStatus === 429 ? 429 : 502,
        );
    }

    public static function transport(string $provider, Throwable $previous): self
    {
        return new self("AI provider [{$provider}] request failed: {$previous->getMessage()}", 502);
    }

    public function status(): int
    {
        return $this->status;
    }

    public function render(Request $request): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'error' => 'ai_provider_error',
        ], $this->status);
    }
}
