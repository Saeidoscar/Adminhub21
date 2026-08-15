<?php

namespace App\Http\Controllers\Api\Users;

use App\Enums\NotificationChannel;
use App\Enums\NotificationStatus;
use App\Enums\PlatformAlertStatus;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use App\Models\PlatformAlert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserNotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $personalNotifications = $user->notifications()
            ->where('channel', NotificationChannel::Database->value)
            ->whereIn('status', [
                NotificationStatus::Pending->value,
                NotificationStatus::Sent->value,
                NotificationStatus::Cancelled->value,
                NotificationStatus::Failed->value,
            ])
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (Notification $notification) => [
                'id' => $notification->id,
                'title' => $notification->title,
                'message' => $notification->body ?: $notification->title,
                'source' => 'personal',
                'type' => $notification->category?->value ?? 'system',
                'typeLabel' => $this->categoryLabel($notification->category?->value),
                'channel' => $notification->channel?->value,
                'channelLabel' => $this->channelLabel($notification->channel?->value),
                'status' => $notification->status?->value,
                'statusLabel' => $this->statusLabel($notification->status?->value),
                'priority' => $notification->priority?->value,
                'priorityLabel' => $this->priorityLabel($notification->priority?->value),
                'isCritical' => (bool) $notification->is_critical,
                'eventKey' => $notification->event_key,
                'templateKey' => $notification->template_key,
                'buttonText' => $notification->metadata['button_text'] ?? null,
                'link' => $notification->metadata['link'] ?? $notification->payload['link'] ?? null,
                'createdAt' => $notification->created_at?->toISOString(),
                'expiresAt' => $notification->expires_at?->toISOString(),
            ])
            ->values();

        $systemNotifications = PlatformAlert::query()
            ->where('status', PlatformAlertStatus::Active->value)
            ->whereIn('target_role', ['all', $user->role->value])
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->where('created_at', '>=', now()->subDays(30))
            ->latest()
            ->limit(50)
            ->get()
            ->map(fn (PlatformAlert $alert) => [
                'id' => $alert->id,
                'title' => null,
                'message' => $alert->message,
                'source' => 'system',
                'type' => $alert->alert_type,
                'typeLabel' => 'سیستمی',
                'channel' => 'database',
                'channelLabel' => 'پیشخوان',
                'status' => $alert->status?->value,
                'statusLabel' => $this->statusLabel($alert->status?->value),
                'priority' => 'normal',
                'priorityLabel' => 'معمولی',
                'isCritical' => false,
                'eventKey' => null,
                'templateKey' => null,
                'buttonText' => $alert->button_text,
                'link' => $alert->link,
                'createdAt' => $alert->created_at?->toISOString(),
                'expiresAt' => $alert->expires_at?->toISOString(),
            ])
            ->values();

        return response()->json([
            'data' => [
                'personalNotifications' => $personalNotifications,
                'systemNotifications' => $systemNotifications,
                'personalNotificationsCount' => $personalNotifications->count(),
                'systemNotificationsCount' => $systemNotifications->count(),
                'notificationsCount' => $personalNotifications->count() + $systemNotifications->count(),
            ],
        ]);
    }

    private function categoryLabel(?string $category): string
    {
        return match ($category) {
            'auth' => 'احراز هویت',
            'contract' => 'قرارداد',
            'payment' => 'مالی',
            'security' => 'امنیتی',
            'legal_deadline' => 'مهلت حقوقی',
            'marketing' => 'اطلاع‌رسانی',
            default => 'سیستمی',
        };
    }

    private function channelLabel(?string $channel): string
    {
        return match ($channel) {
            'sms' => 'پیامک',
            'push' => 'وب پوش',
            'telegram' => 'تلگرام',
            'eitaa' => 'ایتا',
            'bale' => 'بله',
            'call' => 'تماس',
            'email' => 'ایمیل',
            default => 'پیشخوان',
        };
    }

    private function statusLabel(?string $status): string
    {
        return match ($status) {
            'pending' => 'در انتظار',
            'sent', 'active' => 'فعال',
            'failed' => 'ناموفق',
            'cancelled' => 'خوانده‌شده',
            default => 'نامشخص',
        };
    }

    private function priorityLabel(?string $priority): string
    {
        return match ($priority) {
            'low' => 'کم',
            'high' => 'مهم',
            'critical' => 'حیاتی',
            default => 'معمولی',
        };
    }
}
