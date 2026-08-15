<?php

namespace Database\Seeders;

use App\Enums\TicketDepartmentSlug;
use App\Models\TicketDepartment;
use Illuminate\Database\Seeder;

class TicketDepartmentSeeder extends Seeder
{
    public function run(): void
    {
        foreach (TicketDepartmentSlug::cases() as $index => $department) {
            TicketDepartment::query()->updateOrCreate(
                ['slug' => $department->value],
                [
                    'is_active' => true,
                    'is_default' => $department === TicketDepartmentSlug::Support,
                    'sort_order' => ($index + 1) * 10,
                ],
            );
        }
    }
}
