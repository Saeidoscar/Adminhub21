<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\AdminProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email', 'max:254', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:128'],
            'role' => ['required', 'string', 'in:employer,admin'],
            'nameEn' => ['required', 'string', 'min:1', 'max:120'],
            'nameFa' => ['required', 'string', 'min:1', 'max:120'],
            'phone' => ['nullable', 'string', 'max:32'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $data = $validator->validated();

        $existing = User::where('email', strtolower($data['email']))->first();
        if ($existing) {
            return response()->json(['message' => 'An account with this email already exists'], 409);
        }

        $user = new User();
        $user->email = strtolower($data['email']);
        $user->password = Hash::make($data['password']);
        $user->role = $data['role'];
        $user->name_en = $data['nameEn'];
        $user->name_fa = $data['nameFa'];
        $user->phone = $data['phone'] ?? null;
        $user->save();

        if ($user->role === 'admin') {
            AdminProfile::create(['user_id' => $user->id]);
        }

        return response()->json([
            'user' => $this->safeUser($user),
            'accessToken' => $user->createToken('default', ['*'])->plainTextToken,
            'refreshToken' => $this->createRefreshToken($user->id),
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user = User::where('email', strtolower($request->email))->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password'], 401);
        }

        return response()->json([
            'user' => $this->safeUser($user),
            'accessToken' => $user->createToken('default', ['*'])->plainTextToken,
            'refreshToken' => $this->createRefreshToken($user->id),
        ]);
    }

    public function sendOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => ['required', 'string', 'max:32'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $otpExpiresAt = now()->addMinutes(10);

        $user = User::where('phone', $request->phone)->first();
        if ($user) {
            $user->otp_code = $code;
            $user->otp_expires_at = $otpExpiresAt;
            $user->save();
        }

        return response()->json([
            'ok' => true,
            'message' => 'OTP sent successfully',
            'phone' => $request->phone,
        ]);
    }

    public function verifyOtp(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'phone' => ['required', 'string', 'max:32'],
            'code' => ['required', 'string', 'size:6'],
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => $validator->errors()->first()], 422);
        }

        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            $user = User::create([
                'email' => $request->phone.'@otp.local',
                'password' => Hash::make(Str::random(32)),
                'phone' => $request->phone,
                'name_en' => 'User',
                'name_fa' => 'User',
                'role' => 'employer',
            ]);
        }

        if (!$user->otp_code || $user->otp_code !== $request->code) {
            return response()->json(['message' => 'Invalid code'], 400);
        }

        if (!$user->otp_expires_at || $user->otp_expires_at->isPast()) {
            return response()->json(['message' => 'Code expired'], 400);
        }

        $user->otp_code = null;
        $user->otp_expires_at = null;
        $user->save();

        return response()->json([
            'user' => $this->safeUser($user),
            'accessToken' => $user->createToken('default', ['*'])->plainTextToken,
            'refreshToken' => $this->createRefreshToken($user->id),
        ]);
    }

    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        $user->tokens()->delete();
        $token = $user->createToken('default', ['*'])->plainTextToken;

        return response()->json([
            'user' => $this->safeUser($user),
            'accessToken' => $token,
            'refreshToken' => $this->createRefreshToken($user->id),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['ok' => true]);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $this->safeUser($request->user())]);
    }

    private function safeUser(User $user): array
    {
        return [
            'id' => (string) $user->id,
            'email' => $user->email,
            'role' => $user->role,
            'nameEn' => $user->name_en,
            'nameFa' => $user->name_fa,
            'phone' => $user->phone,
            'photo' => $user->photo,
            'phoneVerified' => (bool) $user->phone_verified,
            'createdAt' => $user->created_at?->toISOString(),
        ];
    }

    private function createRefreshToken(string $userId): string
    {
        return hash('sha256', $userId.Str::random(40));
    }
}
