<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('online-user:cleanup')->everyMinute();
Schedule::command('otp:cleanup')->dailyAt('02:00');
Schedule::command('user-verifications:notify-expiring')->dailyAt('09:00');
Schedule::command('notifications:prune-old --days=30')->dailyAt('03:00');

Schedule::command('settlements:dispatch-monthly')
    ->everyTenMinutes()
    ->withoutOverlapping();

Schedule::command('settlements:sync-processing')
    ->everyTenMinutes()
    ->withoutOverlapping();
