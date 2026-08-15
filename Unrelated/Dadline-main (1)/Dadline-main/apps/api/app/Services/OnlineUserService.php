<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Redis;

class OnlineUserService
{
    private const KEY = 'dadline:online-users';

    private const ONLINE_MINUTES = 10;

    public function markOnline(User $user): void
    {
        Redis::zadd(
            self::KEY,
            now()->timestamp,
            $user->id
        );
    }

    public function markOffline(User $user): void
    {
        Redis::zrem(
            self::KEY,
            $user->id
        );
    }

    public function isOnline(User $user): bool
    {
        return Redis::zscore(
            self::KEY,
            $user->id
        ) !== null;
    }

    public function lastSeen(User $user): ?Carbon
    {
        $timestamp = Redis::zscore(
            self::KEY,
            $user->id
        );

        return $timestamp
            ? Carbon::createFromTimestamp((int) $timestamp)
            : null;
    }

    public function onlineIds(): array
    {
        return array_map(
            'intval',
            Redis::zrange(self::KEY, 0, -1)
        );
    }

    public function onlineCount(): int
    {
        return Redis::zcard(self::KEY);
    }

    public function cleanup(): void
    {
        Redis::zremrangebyscore(
            self::KEY,
            0,
            now()->subMinutes(self::ONLINE_MINUTES)->timestamp
        );
    }
}