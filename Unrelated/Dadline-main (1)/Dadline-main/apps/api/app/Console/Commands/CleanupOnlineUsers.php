<?php

namespace App\Console\Commands;

use App\Services\OnlineUserService;
use Illuminate\Console\Command;

class CleanupOnlineUsers extends Command
{
    protected $signature = 'online-user:cleanup';

    protected $description = 'Remove expired online users from Redis';

    public function handle(
        OnlineUserService $onlineUserService
    ): int {

        $onlineUserService->cleanup();

        $this->info('Done.');

        return self::SUCCESS;
    }
}