<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Idempotent: db:seed runs on every container boot, and `email` is
        // unique, so a second create() would abort the whole seeder.
        User::query()->updateOrCreate(
            ['email' => 'admin@adminhub21.com'],
            [
                'name' => 'Super Admin',
                'phone' => '+980000000000',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'is_verified' => true,
            ],
        );
    }
}
