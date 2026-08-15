<?php

namespace Tests\Unit;

use Tests\TestCase;

class HorizonNotificationQueueTest extends TestCase
{
    public function test_horizon_consumes_all_notification_queues(): void
    {
        $queues = config('horizon.defaults.supervisor-1.queue');

        $this->assertIsArray($queues);
        $this->assertContains('default', $queues);
        $this->assertContains('notifications-high', $queues);
        $this->assertContains('notifications', $queues);
        $this->assertContains('notifications-low', $queues);
    }
}
