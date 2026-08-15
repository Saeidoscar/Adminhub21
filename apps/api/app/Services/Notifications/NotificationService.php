<?php

namespace App\Services\Notifications;

use App\Enums\NotificationChannel;
use App\Enums\NotificationCategory;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Models\User;

class NotificationService
{
    public function send(User $user, NotificationCategory $category, string $title, string $body, ?array $data = null): Notification
    {
        $notification = Notification::query()->create([
            'user_id' => $user->id,
            'category' => $category,
            'priority' => \App\Enums\NotificationPriority::Normal,
            'title' => $title,
            'body' => $body,
            'data' => $data,
            'status' => 'pending',
        ]);

        $this->dispatchDeliveries($notification);

        return $notification;
    }

    private function dispatchDeliveries(Notification $notification): void
    {
        foreach ([NotificationChannel::Database, NotificationChannel::Push] as $channel) {
            $notification->deliveries()->create([
                'channel' => $channel,
                'status' => 'pending',
            ]);
        }
    }

    public function markAsRead(Notification $notification): Notification
    {
        $notification->read_at = now();
        $notification->save();

        return $notification;
    }
}
