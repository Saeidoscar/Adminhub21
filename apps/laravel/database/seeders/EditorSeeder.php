<?php

namespace Database\Seeders;

use App\Models\Editor;
use Illuminate\Database\Seeder;

class EditorSeeder extends Seeder
{
    public function run(): void
    {
        Editor::factory()->count(15)->create();
    }
}
