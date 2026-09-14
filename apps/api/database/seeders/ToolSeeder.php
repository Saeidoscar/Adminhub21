<?php

namespace Database\Seeders;

use App\Models\Tool;
use Illuminate\Database\Seeder;

class ToolSeeder extends Seeder
{
    public function run(): void
    {
        $tools = [
            [
                'id' => '11111111-1111-4111-8111-111111111111',
                'name' => 'Laravel Forge',
                'category' => 'automation',
                'icon' => 'settings',
                'rating' => 4.8,
                'reviews' => 1240,
                'popular' => true,
                'price_toman' => 0,
                'price_usd' => 0,
                'desc_en' => 'Server management and deployment platform for Laravel applications.',
                'desc_fa' => 'پلتفرم مدیریت سرور و استقرار برای اپلیکیشن‌های لاراول.',
                'active' => true,
                'created_at' => '2024-01-15 00:00:00',
            ],
            [
                'id' => '22222222-2222-4222-8222-222222222222',
                'name' => 'Postman',
                'category' => 'automation',
                'icon' => 'send',
                'rating' => 4.7,
                'reviews' => 980,
                'popular' => true,
                'price_toman' => 0,
                'price_usd' => 0,
                'desc_en' => 'API development and testing tool with collaboration features.',
                'desc_fa' => 'ابزار توسعه و تست API با ویژگی‌های همکاری.',
                'active' => true,
                'created_at' => '2024-02-01 00:00:00',
            ],
            [
                'id' => '33333333-3333-4333-8333-333333333333',
                'name' => 'Redis Cloud',
                'category' => 'analytics',
                'icon' => 'layers',
                'rating' => 4.6,
                'reviews' => 750,
                'popular' => false,
                'price_toman' => 320000,
                'price_usd' => 8,
                'desc_en' => 'Managed Redis service for real-time caching and messaging.',
                'desc_fa' => 'سرویس مدیریت شده Redis برای کش و پیام‌رسانی لحظه‌ای.',
                'active' => true,
                'created_at' => '2024-03-10 00:00:00',
            ],
            [
                'id' => '44444444-4444-4444-8444-444444444444',
                'name' => 'Sentry',
                'category' => 'analytics',
                'icon' => 'warning',
                'rating' => 4.5,
                'reviews' => 620,
                'popular' => true,
                'price_toman' => 0,
                'price_usd' => 0,
                'desc_en' => 'Error tracking and performance monitoring for applications.',
                'desc_fa' => 'ردیابی خطا و مانیتورینگ عملکرد برای اپلیکیشن‌ها.',
                'active' => true,
                'created_at' => '2024-04-05 00:00:00',
            ],
        ];

        foreach ($tools as $tool) {
            $createdAt = $tool['created_at'];
            unset($tool['created_at']);

            Tool::query()->updateOrCreate(['id' => $tool['id']], $tool);
            Tool::whereKey($tool['id'])->update([
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }
}
