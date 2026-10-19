<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Resolve a counterparty for a contract by exact email address.
 *
 * Deliberately not a directory: it only answers for an address the caller
 * already knows, and returns nothing beyond what a contract needs.
 */
class UserLookupController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()
            ->where('email', $validated['email'])
            ->first(['id', 'name', 'email']);

        if ($user === null) {
            return response()->json(['message' => 'کاربری با این ایمیل پیدا نشد.'], 404);
        }

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
        ]);
    }
}
