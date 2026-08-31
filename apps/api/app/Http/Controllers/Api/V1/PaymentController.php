<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

use App\Enums\PaymentGateway;
use App\Models\PaymentGateway as PaymentGatewayModel;
use App\Services\Payments\PaymentGatewayService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    public function __construct(
        private readonly PaymentGatewayService $gatewayService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $gateways = PaymentGatewayModel::query()->get();

        return response()->json($gateways);
    }

    public function requestPayment(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
            'gateway' => ['required', 'string', 'in:zibal,sep,crypto'],
        ]);

        $gateway = PaymentGateway::from($request->gateway);
        $transaction = $this->gatewayService->initiate($request->user(), $gateway, $request->amount);

        return response()->json($transaction, 201);
    }

    public function show($id): JsonResponse
    {
        $payment = PaymentGatewayModel::query()->findOrFail($id);

        return response()->json($payment);
    }

    public function zibalCallback(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Zibal callback processed']);
    }

    public function sepCallback(Request $request): JsonResponse
    {
        return response()->json(['message' => 'SEP callback processed']);
    }

    public function cryptoCallback(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Crypto callback processed']);
    }
}


