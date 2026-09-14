<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        RateLimiter::for('api', function (Request $request): array {
            return [
                Limit::perMinute((int) env('API_RATE_LIMIT', 60))
                    ->by($request->ip() ?: 'unknown'),
            ];
        });

        RateLimiter::for('auth', function (Request $request): array {
            return [
                Limit::perMinute((int) env('AUTH_RATE_LIMIT', 5))
                    ->by($request->ip() ?: 'unknown'),
            ];
        });

        $this->routes(function (): void {
            Route::prefix('api')
                ->middleware('api')
                ->group(base_path('routes/api.php'));
        });
    }
}
