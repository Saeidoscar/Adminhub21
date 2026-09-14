<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Super Admin',
            'email' => 'admin@adminhub21.com',
            'phone' => '+980000000000',
            'password' => Hash::make('password'),
            'role' => 'super_admin',
            'is_verified' => true,
        ]);
    }
}
