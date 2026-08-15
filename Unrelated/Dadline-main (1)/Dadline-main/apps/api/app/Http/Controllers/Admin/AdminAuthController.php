<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\AdminLoginRequest;
use App\Models\User;
use App\Services\Auth\LegacyPasswordVerifier;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    public function login(
        AdminLoginRequest $request,
        LegacyPasswordVerifier $passwordVerifier,
    ): JsonResponse {
        $validated = $request->validated();
        $field = filter_var($validated['identifier'], FILTER_VALIDATE_EMAIL)
            ? 'email'
            : 'mobile';

        $user = User::query()->where($field, $validated['identifier'])->first();
        $passwordMatches = $user
            ? $passwordVerifier->check($validated['password'], $user->password)
            : false;

        if (! $user || ! $passwordMatches || $user->role !== UserRole::ADMIN) {
            return response()->json([
                'message' => 'اطلاعات ورود مدیر صحیح نیست.',
            ], 422);
        }

        if ($passwordVerifier->needsLaravelRehash($user->password)) {
            $user->forceFill([
                'password' => Hash::make($validated['password']),
            ])->save();
        }

        $user->tokens()->where('name', 'admin-panel')->delete();
        $token = $user->createToken(
            'admin-panel',
            ['admin-panel:access'],
            now()->addHours(8),
        )->plainTextToken;
        $user->forceFill(['last_login_at' => now()])->save();

        return response()->json([
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => (string) $user->id,
                    'firstName' => $user->first_name,
                    'lastName' => $user->last_name,
                    'fullName' => $user->full_name,
                    'mobile' => $user->mobile,
                    'email' => $user->email,
                    'role' => $user->role->value,
                    'roles' => [$user->role->value],
                ],
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'نشست مدیریتی با موفقیت پایان یافت.',
        ]);
    }
}
