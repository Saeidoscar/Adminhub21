<?php

namespace App\Http\Middleware;

use App\Services\OnlineUserService;
use Closure;

class UpdateLastSeen
{
    public function __construct(
        private OnlineUserService $onlineUserService
    ) {}

    public function handle($request, Closure $next)
    {
        if ($user = $request->user()) {
            $this->onlineUserService->markOnline($user);
        }

        return $next($request);
    }
}