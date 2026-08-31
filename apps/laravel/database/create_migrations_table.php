<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;

Schema::create('migrations', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->string('migration');
    $table->integer('batch');
    $table->timestamp('migration_time')->nullable();
});

$migrations = [
    ['0001_01_01_000000_create_users_table', 1],
    ['0001_01_01_000001_create_cache_table', 1],
    ['0001_01_01_000002_create_jobs_table', 1],
    ['2019_12_14_000001_create_personal_access_tokens_table', 1],
];

foreach ($migrations as $m) {
    DB::table('migrations')->insert([
        'id' => Str::random(20),
        'migration' => $m[0],
        'batch' => $m[1],
        'migration_time' => now(),
    ]);
}

echo "Done\n";
