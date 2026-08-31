<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            AdminProfileSeeder::class,
            PackageSeeder::class,
            ToolSeeder::class,
            EditorSeeder::class,
            VibeCoderSeeder::class,
        ]);
    }
}
