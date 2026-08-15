<?php

namespace App\Jobs\Auth;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Models\User;
use App\Services\Notifications\Data\NotificationDispatchData;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Contracts\Queue\ShouldBeEncrypted;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SendOtpCallJob implements ShouldBeEncrypted, ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $mobile,
        public string $code
    ) {}

    public function handle(NotificationDispatcher $notifications): void
    {
        $user = User::query()
            ->where('mobile', $this->mobile)
            ->first();

        $notifications->dispatch(new NotificationDispatchData(
            user: $user,
            recipient: $this->mobile,
            templateKey: 'auth.otp.call',
            context: [
                'code' => $this->code,
                'message' => "کد ورود دادلاین: {$this->code}",
            ],
            channels: [
                NotificationChannel::Call,
                NotificationChannel::Bale,
            ],
            eventKey: 'auth.otp.call.requested',
            category: NotificationCategory::Auth,
            priority: NotificationPriority::Critical,
            critical: true,
            dedupeKey: "auth.otp.call:{$this->mobile}:{$this->code}",
        ));
    }
}
