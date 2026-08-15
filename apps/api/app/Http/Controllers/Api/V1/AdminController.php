<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Notifications\NotificationService;
use App\Enums\NotificationCategory;
use App\Models\User;
use App\Models\Option;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'users' => \App\Models\User::query()->count(),
            'packages' => \App\Models\Package::query()->count(),
            'contracts' => \App\Models\Contract::query()->count(),
            'reviews' => \App\Models\Review::query()->count(),
            'tickets' => \App\Models\Ticket::query()->count(),
        ]);
    }

    public function users(Request $request): JsonResponse
    {
        $users = \App\Models\User::query()->paginate();

        return response()->json($users);
    }

    public function banUser($id): JsonResponse
    {
        $user = User::query()->findOrFail($id);
        $user->update(['is_banned' => true]);

        return response()->json($user);
    }

    public function unbanUser($id): JsonResponse
    {
        $user = User::query()->findOrFail($id);
        $user->update(['is_banned' => false]);

        return response()->json($user);
    }

    public function reports(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Reports endpoint']);
    }

    public function settings(Request $request): JsonResponse
    {
        $settings = Option::query()->get();

        return response()->json($settings);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
        ]);

        foreach ($request->settings as $key => $value) {
            Option::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => 'admin']
            );
        }

        return response()->json(['message' => 'Settings updated']);
    }

    public function sendNotification(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'category' => ['nullable', 'string'],
        ]);

        $user = User::query()->findOrFail($request->user_id);
        $category = NotificationCategory::tryFrom($request->category ?? 'system') ?? NotificationCategory::System;

        $notification = $this->notificationService->send($user, $category, $request->title, $request->body);

        return response()->json($notification, 201);
    }
}
