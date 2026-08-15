<?php

namespace App\Http\Controllers\Api\V1;

use App\Actions\AdminProfile\CreateAdminProfileAction;
use App\Actions\AdminProfile\UpdateAdminProfileAction;
use App\Actions\AdminProfile\ToggleVerificationAction;
use App\Models\AdminProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function __construct(
        private readonly CreateAdminProfileAction $createProfile,
        private readonly UpdateAdminProfileAction $updateProfile,
        private readonly ToggleVerificationAction $toggleVerification,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $profiles = AdminProfile::query()
            ->with(['user:id,name,email,avatar'])
            ->paginate();

        return response()->json($profiles);
    }

    public function show($id): JsonResponse
    {
        $profile = AdminProfile::query()
            ->where('user_id', $id)
            ->with(['user', 'photo', 'insuranceDocument'])
            ->firstOrFail();

        return response()->json($profile);
    }

    public function update(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        if ($profile === null) {
            $profile = $this->createProfile->execute($request->user(), $request->all());

            return response()->json($profile, 201);
        }

        $profile = $this->updateProfile->execute($profile, $request->all());

        return response()->json($profile);
    }

    public function uploadAvatar(Request $request): JsonResponse
    {
        $request->validate([
            'avatar' => ['required', 'image', 'max:2048'],
        ]);

        $user = $request->user();
        $path = $request->file('avatar')->store('avatars', 's3');

        $user->avatar = $path;
        $user->save();

        return response()->json(['avatar' => $path]);
    }

    public function deleteAvatar(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->avatar) {
            Storage::disk('s3')->delete($user->avatar);
            $user->avatar = null;
            $user->save();
        }

        return response()->json(null, 204);
    }
}
