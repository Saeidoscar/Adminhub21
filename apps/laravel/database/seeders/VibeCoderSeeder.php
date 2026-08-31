<?php

namespace Database\Seeders;

use App\Models\VibeCoder;
use Illuminate\Database\Seeder;

class VibeCoderSeeder extends Seeder
{
    public function run(): void
    {
        VibeCoder::factory()->count(15)->create();
    }
}
