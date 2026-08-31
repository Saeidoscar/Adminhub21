<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tables = Illuminate\Support\Facades\DB::select("SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename");
foreach ($tables as $t) {
    echo $t->tablename . PHP_EOL;
}
