<?php

namespace App\Http\Controllers\Api\Webhooks;

use App\Http\Controllers\Controller;
use App\Services\ExternalServices\OptionServiceSettings;
use App\Services\Settlements\PayoutSettlementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class ZibalEbankWebhookController extends Controller
{
    public function __invoke(
        Request $request,
        string $token,
        OptionServiceSettings $settings,
        PayoutSettlementService $settlements,
    ): JsonResponse {
        $configuredToken = $settings->string('zibal_ebank_webhook_token');

        if ($configuredToken === null || ! hash_equals($configuredToken, $token)) {
            abort(404);
        }

        $payload = $request->all();
        $handled = $settlements->handleWebhook($payload);

        if (! $handled) {
            Log::warning('Unknown Zibal EBank payout webhook.', [
                'request_id' => (string) Str::uuid(),
                'unique_code' => $payload['data']['unique_code'] ?? $payload['data']['uniqueCode'] ?? null,
                'tracker_id' => $payload['data']['tracker_id'] ?? $payload['data']['trackerId'] ?? null,
            ]);
        }

        return response()->json([
            'success' => true,
            'handled' => $handled,
        ]);
    }
}
