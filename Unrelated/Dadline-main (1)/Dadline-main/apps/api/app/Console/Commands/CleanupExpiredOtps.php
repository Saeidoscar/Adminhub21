<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Otp;

class CleanupExpiredOtps extends Command
{
    protected $signature = 'otp:cleanup';
    protected $description = 'Delete expired OTP codes';

    public function handle(): int
    {
        $deleted = Otp::where('expires_at', '<', now())
            ->whereNull('verified_at')
            ->delete();
        $this->info("Deleted {$deleted} expired OTPs.");
        return self::SUCCESS;
    }
}