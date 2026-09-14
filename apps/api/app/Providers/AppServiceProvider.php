<?php

namespace App\Providers;

use App\Hashing\Argon2IdHasher;
use Illuminate\Hashing\BcryptHasher;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Hash::extend('argon2id', function ($app): Argon2IdHasher {
            return new Argon2IdHasher(
                $app['config']->get('hashing.argon2id') ?? [],
                new BcryptHasher($app['config']->get('hashing.bcrypt') ?? []),
            );
        });
    }
}
