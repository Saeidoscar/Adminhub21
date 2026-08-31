<?php

namespace Database\Seeders;

use App\Models\AdminProfile;
use Illuminate\Database\Seeder;

class AdminProfileSeeder extends Seeder
{
    public function run(): void
    {
        AdminProfile::factory()->count(10)->create();
    }
}
