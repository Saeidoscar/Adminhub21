<?php

namespace App\Http\Controllers\Auth;

use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use App\Enums\PlatformAlertStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\Notification;
use App\Models\PlatformAlert;
use App\Models\User;
use App\Services\Auth\LegacyPasswordVerifier;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function login(LoginRequest $request, LegacyPasswordVerifier $passwordVerifier)
    {
        $validated = $request->validated();
        $field = filter_var($validated['identifier'], FILTER_VALIDATE_EMAIL)
            ? 'email'
            : 'mobile';

        $user = User::where($field, $validated['identifier'])->first();
        $passwordMatches = $passwordVerifier->check($validated['password'], $user->password ?? null);

        if (! $user || ! $passwordMatches) {
            return response()->json([
                'success' => false,
                'message' => 'اطلاعات ورود صحیح نیست.',
                'errors' => [
                    'password' => [
                        'اطلاعات ورود صحیح نیست.',
                    ],
                ],
            ], 422);
        }

        if ($passwordVerifier->needsLaravelRehash($user->password)) {
            $user->forceFill([
                'password' => Hash::make($validated['password']),
            ])->save();
        }

        $token = $user
            ->createToken('auth-token')
            ->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'ورود موفقیت‌آمیز بود.',
            'data' => [
                'user' => new UserResource($user),
                'token' => $token,
            ],
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->loadMissing([
            'profile.avatar',
            'wallet',
        ]);

        $tasksQuery = $user->tasks()->orderByDesc('updated_at');
        $unreadTasksCount = (clone $tasksQuery)
            ->where('is_viewed', false)
            ->count();

        $alertsQuery = PlatformAlert::query()
            ->where('status', PlatformAlertStatus::Active->value)
            ->whereIn('target_role', ['all', $user->role->value])
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderByDesc('created_at');

        $notificationsCount = (clone $alertsQuery)->count();
        $personalNotificationsQuery = $user->notifications()
            ->where('channel', NotificationChannel::Database->value)
            ->whereIn('status', [
                NotificationStatus::Pending->value,
                NotificationStatus::Sent->value,
            ])
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderByDesc('created_at');

        $personalNotificationsCount = (clone $personalNotificationsQuery)->count();

        return response()->json([
            'success' => true,
            'data' => [
                'user' => new UserResource($user),
                'header' => [
                    'balance' => (int) ($user->wallet?->balance ?? 0),
                    'unreadTasksCount' => $unreadTasksCount,
                    'tasks' => $tasksQuery
                        ->limit(6)
                        ->get()
                        ->map(fn ($task) => [
                            'id' => $task->id,
                            'title' => $task->title,
                            'link' => $task->link,
                            'priority' => $task->priority->value,
                            'isViewed' => $task->is_viewed,
                            'updatedAt' => $task->updated_at?->toISOString(),
                        ])
                        ->values(),
                    'notificationsCount' => $personalNotificationsCount + $notificationsCount,
                    'personalNotificationsCount' => $personalNotificationsCount,
                    'systemNotificationsCount' => $notificationsCount,
                    'personalNotifications' => $personalNotificationsQuery
                        ->limit(6)
                        ->get()
                        ->map(fn (Notification $notification) => [
                            'id' => $notification->id,
                            'message' => $notification->body ?: $notification->title,
                            'type' => $notification->category?->value ?? 'personal',
                            'buttonText' => $notification->metadata['button_text'] ?? null,
                            'link' => $notification->metadata['link'] ?? $notification->payload['link'] ?? null,
                            'createdAt' => $notification->created_at?->toISOString(),
                        ])
                        ->values(),
                    'systemNotifications' => $alertsQuery
                        ->limit(6)
                        ->get()
                        ->map(fn (PlatformAlert $alert) => [
                            'id' => $alert->id,
                            'message' => $alert->message,
                            'type' => $alert->alert_type,
                            'buttonText' => $alert->button_text,
                            'link' => $alert->link,
                            'createdAt' => $alert->created_at?->toISOString(),
                        ])
                        ->values(),
                    'notifications' => $alertsQuery
                        ->limit(6)
                        ->get()
                        ->map(fn (PlatformAlert $alert) => [
                            'id' => $alert->id,
                            'message' => $alert->message,
                            'type' => $alert->alert_type,
                            'buttonText' => $alert->button_text,
                            'link' => $alert->link,
                            'createdAt' => $alert->created_at?->toISOString(),
                        ])
                        ->values(),
                ],
            ],
        ]);
    }

    public function dismissNotification(Request $request)
    {
        $validated = $request->validate([
            'source' => ['required', 'string', Rule::in(['personal'])],
            'id' => ['nullable', 'integer', 'min:1'],
            'all' => ['sometimes', 'boolean'],
        ]);

        $user = $request->user();
        $dismissAll = (bool) ($validated['all'] ?? false);

        $query = Notification::query()
            ->where('user_id', $user->id)
            ->where('channel', NotificationChannel::Database->value)
            ->whereIn('status', [
                NotificationStatus::Pending->value,
                NotificationStatus::Sent->value,
            ]);

        if (! $dismissAll) {
            if (empty($validated['id'])) {
                throw ValidationException::withMessages([
                    'id' => 'شناسه اعلان الزامی است.',
                ]);
            }

            $query->whereKey((int) $validated['id']);
        }

        $updated = $query
            ->update([
                'status' => NotificationStatus::Cancelled->value,
            ]);

        if ($updated !== 1) {
            throw ValidationException::withMessages([
                'id' => 'اعلان موردنظر پیدا نشد.',
            ]);
        }

        return response()->json([
            'message' => 'اعلان شخصی از لیست شما حذف شد.',
        ]);
    }
}
