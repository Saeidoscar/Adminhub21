<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\VerifyPaymentCallback;
use Illuminate\Auth\Middleware\Authenticate;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Routing\Middleware\SubstituteBindings;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(append: [
            SubstituteBindings::class,
            EnsureFrontendRequestsAreStateful::class,
        ]);
        $middleware->throttleApi('api');

        $middleware->alias([
            'auth.sanctum' => Authenticate::class,
            'admin' => AdminMiddleware::class,
            'payment.callback' => VerifyPaymentCallback::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
