<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;

use App\Enums\OfferStatus;
use App\Models\Offer;
use App\Models\Package;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfferController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $offers = Offer::query()
            ->where('user_id', $request->user()->id)
            ->orWhere('target_user_id', $request->user()->id)
            ->with(['user', 'targetUser', 'package'])
            ->paginate();

        return response()->json($offers);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'target_user_id' => ['required', 'integer', 'exists:users,id'],
            'package_id' => ['nullable', 'integer', 'exists:packages,id'],
            'message' => ['required', 'string'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'size:3'],
            'expires_at' => ['nullable', 'date'],
        ]);

        $offer = Offer::query()->create([
            'user_id' => $request->user()->id,
            'target_user_id' => $request->target_user_id,
            'package_id' => $request->package_id,
            'message' => $request->message,
            'amount' => $request->amount,
            'currency' => $request->currency ?? 'USD',
            'status' => OfferStatus::Pending->value,
            'expires_at' => $request->expires_at,
        ]);

        return response()->json($offer->load(['user', 'targetUser', 'package']), 201);
    }

    public function show(Offer $offer): JsonResponse
    {
        $offer->load(['user', 'targetUser', 'package']);

        return response()->json($offer);
    }

    public function update(Request $request, Offer $offer): JsonResponse
    {
        $offer->update($request->validate([
            'message' => ['nullable', 'string'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'expires_at' => ['nullable', 'date'],
        ]));

        return response()->json($offer->load(['user', 'targetUser', 'package']));
    }

    public function destroy(Offer $offer): JsonResponse
    {
        $offer->delete();

        return response()->json(null, 204);
    }

    public function accept(Offer $offer): JsonResponse
    {
        $offer->update(['status' => OfferStatus::Accepted->value]);

        return response()->json($offer->load(['user', 'targetUser', 'package']));
    }

    public function reject(Offer $offer): JsonResponse
    {
        $offer->update(['status' => OfferStatus::Rejected->value]);

        return response()->json($offer->load(['user', 'targetUser', 'package']));
    }
}


