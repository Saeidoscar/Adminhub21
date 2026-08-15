<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

trait CreatesApplication
{
    public function createApplication(): \Illuminate\Foundation\Application
    {
        $app = require __DIR__.'/../bootstrap/app.php';

        $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

        return $app;
    }
}
