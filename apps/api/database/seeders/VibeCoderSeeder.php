<?php

namespace Database\Seeders;

use App\Models\VibeCoder;
use Illuminate\Database\Seeder;

class VibeCoderSeeder extends Seeder
{
    public function run(): void
    {
        $vibeCoders = [
            [
                'id' => '99999999-9999-4999-8999-999999999999',
                'name_en' => 'Alex Rivera',
                'name_fa' => 'الکس ریورا',
                'photo' => 'photo-1506794778202-cad84cf45f1d',
                'stack' => 'webApp',
                'rating' => 4.8,
                'reviews' => 92,
                'projects' => 156,
                'rate_toman' => 3500000,
                'rate_usd' => 85,
                'delivery' => '1 week',
                'bio_en' => 'Vibe coder focused on rapid prototyping and AI-assisted development.',
                'bio_fa' => 'وایب کدر متمرکز بر نمونه‌سازی سریع و توسعه با کمک هوش مصنوعی.',
                'active' => true,
                'created_at' => '2024-01-20 00:00:00',
            ],
            [
                'id' => 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
                'name_en' => 'Fatima Noor',
                'name_fa' => 'فاطمه نور',
                'photo' => 'photo-1534528741775-53994a69daeb',
                'stack' => 'automation',
                'rating' => 4.9,
                'reviews' => 78,
                'projects' => 134,
                'rate_toman' => 3200000,
                'rate_usd' => 78,
                'delivery' => '3 days',
                'bio_en' => 'Full-stack vibe coder shipping production-ready apps in days.',
                'bio_fa' => 'وایب کدر فول‌استک تحویل اپ‌های آماده تولید در عرض روزها.',
                'active' => true,
                'created_at' => '2024-02-08 00:00:00',
            ],
            [
                'id' => 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
                'name_en' => 'Omar Hassan',
                'name_fa' => 'عمر حسن',
                'photo' => 'photo-1507003211169-0a1dd7228f2d',
                'stack' => 'bots',
                'rating' => 4.7,
                'reviews' => 55,
                'projects' => 89,
                'rate_toman' => 2900000,
                'rate_usd' => 70,
                'delivery' => '1 week',
                'bio_en' => 'Vue ecosystem expert building seamless full-stack experiences.',
                'bio_fa' => 'متخصص اکوسیستم Vue خالق تجربیات فول‌استک یکپارچه.',
                'active' => true,
                'created_at' => '2024-04-12 00:00:00',
            ],
            [
                'id' => 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
                'name_en' => 'Lina Zayed',
                'name_fa' => 'لنا زاید',
                'photo' => 'photo-1544005313-94ddf0286df2',
                'stack' => 'frontend',
                'rating' => 4.6,
                'reviews' => 41,
                'projects' => 67,
                'rate_toman' => 2700000,
                'rate_usd' => 65,
                'delivery' => '1 week',
                'bio_en' => 'AI-powered vibe coder specializing in data-driven web apps.',
                'bio_fa' => 'وایب کدر با هوش مصنوعی متخصص در اپ‌های وب مبتنی بر داده.',
                'active' => true,
                'created_at' => '2024-05-01 00:00:00',
            ],
        ];

        foreach ($vibeCoders as $vibeCoder) {
            $createdAt = $vibeCoder['created_at'];
            unset($vibeCoder['created_at']);

            VibeCoder::query()->updateOrCreate(['id' => $vibeCoder['id']], $vibeCoder);
            VibeCoder::whereKey($vibeCoder['id'])->update([
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }
}
