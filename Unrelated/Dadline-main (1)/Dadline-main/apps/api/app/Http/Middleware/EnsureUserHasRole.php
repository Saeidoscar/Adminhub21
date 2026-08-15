<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    /**
     * مثال استفاده در route:
     *   ->middleware('role:admin')
     *   ->middleware('role:admin,expert')   // کافیست یکی از این دو نقش را داشته باشد
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Unauthenticated.',
            ], 401);
        }

        if (! $user->hasRole($roles)) {
            return response()->json([
                'message' => 'شما اجازه دسترسی به این بخش را ندارید.',
            ], 403);
        }

        return $next($request);
    }
}
