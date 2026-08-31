<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AffiliateController extends Controller
{
    public function __construct(
        private readonly \App\Actions\Affiliates\GenerateReferralCodeAction $generateCode,
    ) {}

    public function stats(Request $request): JsonResponse
    {
        $affiliate = Affiliate::query()->where('user_id', $request->user()->id)->first();

        return response()->json([
            'stats' => [
                'totalReferrals' => $affiliate?->commissions()->count() ?? 0,
                'totalCommission' => $affiliate?->commissions()->sum('amount') ?? 0,
                'pendingCommission' => $affiliate?->commissions()->where('status', 'pending')->sum('amount') ?? 0,
                'paidCommission' => $affiliate?->commissions()->where('status', 'paid')->sum('amount') ?? 0,
            ]
        ]);
    }

    public function codes(Request $request): JsonResponse
    {
        $affiliate = Affiliate::query()->where('user_id', $request->user()->id)->first();

        if (!$affiliate) {
            return response()->json(['code' => null]);
        }

        return response()->json(['code' => [
            'id' => (string) $affiliate->id,
            'userId' => (string) $affiliate->user_id,
            'userName' => $affiliate->user->name,
            'userEmail' => $affiliate->user->email,
            'code' => $affiliate->referral_code,
            'isActive' => $affiliate->status === 'active',
            'createdAt' => $affiliate->created_at?->toISOString() ?? now()->toISOString(),
        ]]);
    }

    public function referrals(Request $request): JsonResponse
    {
        $affiliate = Affiliate::query()->where('user_id', $request->user()->id)->firstOrFail();

        $commissions = $affiliate->commissions()
            ->with(['sourceTransaction.user', 'commissionTransaction'])
            ->get()
            ->map(function ($commission) {
                return [
                    'id' => (string) $commission->id,
                    'codeId' => (string) $commission->affiliate_id,
                    'code' => $commission->affiliate->referral_code,
                    'referrerId' => (string) $commission->affiliate->user_id,
                    'referrerName' => $commission->affiliate->user->name,
                    'referredId' => $commission->sourceTransaction->user_id ?? null,
                    'referredName' => $commission->sourceTransaction->user->name ?? null,
                    'amountToman' => $commission->amount,
                    'amountUSD' => 0,
                    'status' => $commission->status,
                    'paidAt' => $commission->commissionTransaction?->created_at?->toISOString(),
                    'createdAt' => $commission->created_at?->toISOString() ?? now()->toISOString(),
                ];
            });

        return response()->json(['commissions' => $commissions]);
    }

    public function commissions(Request $request): JsonResponse
    {
        $affiliate = Affiliate::query()->where('user_id', $request->user()->id)->firstOrFail();

        $commissions = $affiliate->commissions()
            ->with(['sourceTransaction.user', 'commissionTransaction'])
            ->paginate();

        return response()->json($commissions);
    }

    public function withdraw(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
        ]);

        $affiliate = Affiliate::query()->where('user_id', $request->user()->id)->firstOrFail();

        return response()->json(['message' => 'Withdrawal requested']);
    }

    public function generateCode(Request $request): JsonResponse
    {
        $affiliate = $this->generateCode->execute($request->user());

        return response()->json($affiliate);
    }
}


