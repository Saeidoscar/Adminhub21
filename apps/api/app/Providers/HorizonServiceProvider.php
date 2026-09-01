<?php

namespace App\Providers;

use Illuminate\Support\Facades\Gate;
use Laravel\Horizon\Horizon;
use Laravel\Horizon\HorizonApplicationServiceProvider;

class HorizonServiceProvider extends HorizonApplicationServiceProvider
{
    public function boot(): void
    {
        parent::boot();

        Horizon::routeSmsNotificationsTo('15556667777');
        Horizon::routeMailNotificationsTo('horizon@adminhub21.com');
        Horizon::routeSlackNotificationsTo(env('HORIZON_SLACK_WEBHOOK'), '#horizon');
    }

    protected function authorization(): void
    {
        Horizon::auth(fn ($request) => app()->environment('local') ||
            ($request->user() !== null && $request->user()->is_admin === true)
        );
    }

    protected function gate(): void
    {
        Gate::define('viewHorizon', function ($user) {
            return app()->environment('local') || $user->is_admin === true;
        });
    }
}
