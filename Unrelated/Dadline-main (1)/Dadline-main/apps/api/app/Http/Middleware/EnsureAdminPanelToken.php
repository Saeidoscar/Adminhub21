<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPanelToken
{
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->user()?->currentAccessToken();

        if (
            ! $token instanceof PersonalAccessToken
            || $token->name !== 'admin-panel'
            || ! in_array('admin-panel:access', $token->abilities ?? [], true)
        ) {
            return response()->json([
                'message' => 'این توکن برای دسترسی به پنل مدیریت معتبر نیست.',
            ], 403);
        }

        return $next($request);
    }
}
