<?php

namespace Tests\Unit;

use App\Enums\NotificationChannel;
use App\Jobs\Auth\SendOtpCallJob;
use App\Jobs\Auth\SendOtpSmsJob;
use App\Jobs\Notifications\SendNotificationDeliveryJob;
use App\Models\Notification;
use App\Models\NotificationDelivery;
use App\Services\Notifications\NotificationDispatcher;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Bus;
use Tests\TestCase;

class AuthOtpBaleDeliveryTest extends TestCase
{
    use RefreshDatabase;

    public function test_sms_otp_creates_independent_sms_and_bale_deliveries(): void
    {
        Bus::fake([SendNotificationDeliveryJob::class]);

        (new SendOtpSmsJob('09121234567', '123456'))
            ->handle(app(NotificationDispatcher::class));

        $notification = Notification::query()
            ->where('template_key', 'auth.otp.sms')
            ->sole();

        $this->assertSame(
            [NotificationChannel::Bale, NotificationChannel::Sms],
            $notification->deliveries()
                ->orderBy('channel')
                ->pluck('channel')
                ->all(),
        );

        $this->assertBaleOtpDelivery($notification->id, '09121234567', '123456');
        Bus::assertDispatchedTimes(SendNotificationDeliveryJob::class, 2);
    }

    public function test_call_otp_creates_independent_call_and_bale_deliveries(): void
    {
        Bus::fake([SendNotificationDeliveryJob::class]);

        (new SendOtpCallJob('09121234567', '654321'))
            ->handle(app(NotificationDispatcher::class));

        $notification = Notification::query()
            ->where('template_key', 'auth.otp.call')
            ->sole();

        $this->assertSame(
            [NotificationChannel::Bale, NotificationChannel::Call],
            $notification->deliveries()
                ->orderBy('channel')
                ->pluck('channel')
                ->all(),
        );

        $this->assertBaleOtpDelivery($notification->id, '09121234567', '654321');
        Bus::assertDispatchedTimes(SendNotificationDeliveryJob::class, 2);
    }

    private function assertBaleOtpDelivery(int $notificationId, string $mobile, string $code): void
    {
        $delivery = NotificationDelivery::query()
            ->where('notification_id', $notificationId)
            ->where('channel', NotificationChannel::Bale->value)
            ->sole();

        $this->assertSame($mobile, $delivery->recipient);
        $this->assertSame($code, data_get($delivery->payload, 'code'));
        $this->assertStringContainsString($code, (string) $delivery->body);
    }
}
