<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\Affiliates\GenerateReferralCodeAction;
use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AffiliateController extends Controller
{
    public function __construct(
        private readonly GenerateReferralCodeAction $generateCode,
    ) {}

    public function stats(Request $request): JsonResponse
    {
        $affiliate = Affiliate::query()->where('user_id', $request->user()->id)->first();

        return response()->json([
            'affiliate' => $affiliate,
            'total_referrals' => $affiliate?->commissions()->count() ?? 0,
            'total_commission' => $affiliate?->commissions()->sum('amount') ?? 0,
        ]);
    }

    public function referrals(Request $request): JsonResponse
    {
        $affiliate = Affiliate::query()->where('user_id', $request->user()->id)->firstOrFail();

        return response()->json($affiliate->commissions()->with(['sourceTransaction.user'])->paginate());
    }

    public function commissions(Request $request): JsonResponse
    {
        $affiliate = Affiliate::query()->where('user_id', $request->user()->id)->firstOrFail();

        return response()->json($affiliate->commissions()->paginate());
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
