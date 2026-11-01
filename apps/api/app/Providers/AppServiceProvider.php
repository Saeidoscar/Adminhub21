<?php

namespace App\Providers;

use App\Hashing\Argon2IdHasher;
use GuzzleHttp\Client;
use Illuminate\Hashing\BcryptHasher;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        /*
        | Every AI provider class builds on `app('guzzle')`, so the client needs
        | a container binding. Timeouts are explicit because every call happens
        | inside a queued job that must not hang: the queue worker's `timeout`
        | is 120s, so a single HTTP call is capped well below it.
        */
        $this->app->singleton('guzzle', static fn (): Client => new Client([
            'timeout' => (float) config('services.ai_http.timeout', 45),
            'connect_timeout' => (float) config('services.ai_http.connect_timeout', 10),
            'http_errors' => true,
        ]));
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
