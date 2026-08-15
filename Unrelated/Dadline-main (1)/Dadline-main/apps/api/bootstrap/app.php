<?php

use App\Http\Middleware\EnsureAdminPanelRequest;
use App\Http\Middleware\EnsureAdminPanelToken;
use App\Http\Middleware\EnsureUserHasRole;
use App\Http\Middleware\UpdateLastSeen;
use App\Services\ExternalServices\Exceptions\ExternalServiceException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        apiPrefix: '',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role' => EnsureUserHasRole::class,
            'admin.panel' => EnsureAdminPanelRequest::class,
            'admin.panel.token' => EnsureAdminPanelToken::class,
        ]);
        $middleware->appendToGroup('api', UpdateLastSeen::class);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request): bool => true,
        );

        $exceptions->render(function (ExternalServiceException $exception) {
            report($exception);

            return response()->json([
                'message' => 'سرویس استعلام موقتاً در دسترس نیست؛ کمی بعد دوباره تلاش کنید.',
                'error' => [
                    'provider' => $exception->provider,
                    'service' => $exception->service,
                    'code' => $exception->errorCode,
                    'retryable' => $exception->retryable,
                ],
            ], 503);
        });
    })
    ->create();
