<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RequireAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!Auth::guard('sanctum')->check()) {
            return response()->json(['message' => 'Missing access token', 'code' => 'UNAUTHORIZED'], 401);
        }

        $request->setUserResolver(function () use ($request) {
            return Auth::guard('sanctum')->user();
        });

        return $next($request);
    }
}
