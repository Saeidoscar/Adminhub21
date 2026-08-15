<?php

namespace App\Http\Controllers\Api\Payments;

use App\Http\Controllers\Controller;
use App\Models\WalletTransactionPayment;
use App\Services\ExternalServices\Exceptions\ExternalServiceException;
use App\Services\Identity\UserBankIdentityVerificationService;
use App\Services\Payments\PaymentGatewayManager;
use App\Services\Purchases\PurchasePaymentService;
use App\Services\Wallet\WalletService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Validation\ValidationException;
use Throwable;

class GatewayPaymentCallbackController extends Controller
{
    public function __invoke(
        Request $request,
        PurchasePaymentService $payments,
        PaymentGatewayManager $gateways,
        WalletService $wallets,
        UserBankIdentityVerificationService $bankIdentityVerification,
    ): RedirectResponse {
        $payment = $this->payment($request);

        try {
            $response = app(PaymentCallbackController::class)(
                $request,
                $payment,
                $payments,
                $gateways,
                $wallets,
                $bankIdentityVerification,
            );

            $fulfillment = $response->getData(true)['data']['fulfillment'] ?? null;

            return $this->redirectToReturnUrl(
                $request,
                $response->isSuccessful() ? 'success' : 'failed',
                $payment,
                is_array($fulfillment) ? $fulfillment : null,
            );
        } catch (ExternalServiceException) {
            return $this->redirectToReturnUrl(
                $request,
                'success',
                $payment->refresh(),
                ['status' => 'unavailable'],
            );
        } catch (ValidationException) {
            return $this->redirectToReturnUrl($request, 'failed', $payment);
        } catch (Throwable) {
            return $this->redirectToReturnUrl($request, 'failed', $payment);
        }
    }

    private function payment(Request $request): WalletTransactionPayment
    {
        $paymentId = $request->input('ResNum')
            ?? $request->input('res_num')
            ?? $request->input('resNum')
            ?? $request->input('orderId')
            ?? $request->input('payment_id')
            ?? $request->input('payment');

        if ($paymentId !== null) {
            return WalletTransactionPayment::query()->findOrFail((int) $paymentId);
        }

        $trackId = $request->input('trackId') ?? $request->input('track_id');

        if ($trackId !== null) {
            return WalletTransactionPayment::query()
                ->where('gateway_token', (string) $trackId)
                ->orWhere('authority', (string) $trackId)
                ->firstOrFail();
        }

        throw ValidationException::withMessages([
            'payment' => 'Payment identifier is missing from gateway callback.',
        ]);
    }

    private function redirectToReturnUrl(
        Request $request,
        string $status,
        WalletTransactionPayment $payment,
        ?array $fulfillment = null,
    ): RedirectResponse
    {
        $url = $this->returnUrl($request, $payment);
        $separator = str_contains($url, '?') ? '&' : '?';
        $redirectUrl = $this->normalizeReturnUrl($url.$separator.http_build_query([
            'payment' => $status,
            'paymentId' => $payment->id,
            'purchaseType' => $payment->request_payload['purchase_type'] ?? null,
            'returnContext' => $payment->request_payload['return_context'] ?? null,
            'inquiry' => $fulfillment === null
                ? null
                : (($fulfillment['status'] ?? null) === 'unavailable'
                    ? 'unavailable'
                    : (($fulfillment['matched'] ?? false) ? 'matched' : 'not_matched')),
        ]));

        return redirect()->away($redirectUrl, Response::HTTP_FOUND);
    }

    private function returnUrl(Request $request, WalletTransactionPayment $payment): string
    {
        $paymentReturnUrl = $payment->request_payload['return_url'] ?? null;

        if (is_string($paymentReturnUrl) && $paymentReturnUrl !== '') {
            return $this->normalizeReturnUrl($paymentReturnUrl);
        }

        $configuredUrl = config('services.payment.return_url');

        if (is_string($configuredUrl) && $configuredUrl !== '') {
            return $this->normalizeReturnUrl($configuredUrl);
        }

        $host = $request->getHost();

        if (in_array($host, ['localhost', '127.0.0.1', '0.0.0.0'], true)) {
            return 'http://localhost:3000/pishkhan/wallet';
        }

        return 'https://dadline.net/pishkhan/wallet';
    }

    private function normalizeReturnUrl(string $url): string
    {
        $parts = parse_url($url);

        if ($parts === false || ! isset($parts['scheme'], $parts['host'])) {
            return $url;
        }

        $host = $parts['host'] === '0.0.0.0' ? 'localhost' : $parts['host'];
        $port = isset($parts['port']) ? ':'.$parts['port'] : '';
        $path = rtrim($parts['path'] ?? '/pishkhan/wallet', '/');
        $query = isset($parts['query']) ? '?'.$parts['query'] : '';

        return $parts['scheme'].'://'.$host.$port.$path.$query;
    }
}
