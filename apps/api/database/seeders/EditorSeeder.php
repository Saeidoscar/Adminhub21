<?php

namespace Database\Seeders;

use App\Models\Editor;
use Illuminate\Database\Seeder;

class EditorSeeder extends Seeder
{
    public function run(): void
    {
        $editors = [
            [
                'id' => '55555555-5555-4555-8555-555555555555',
                'name_en' => 'Sarah Chen',
                'name_fa' => 'سارا چن',
                'photo' => 'photo-1494790108377-be9c29b29330',
                'specialty' => 'video',
                'rating' => 4.9,
                'reviews' => 85,
                'projects' => 142,
                'delivery' => '2 weeks',
                'rate_toman' => 4500000,
                'rate_usd' => 110,
                'bio_en' => 'Senior frontend architect with 10+ years of React and Vue experience.',
                'bio_fa' => 'معمار ارشد فرانت‌اند با بیش از 10 سال تجربه در React و Vue.',
                'active' => true,
                'created_at' => '2024-01-10 00:00:00',
            ],
            [
                'id' => '66666666-6666-4666-8666-666666666666',
                'name_en' => 'Mohammad Rezaei',
                'name_fa' => 'محمد رضایی',
                'photo' => 'photo-1500648767791-00dcc994a43e',
                'specialty' => 'photo',
                'rating' => 4.8,
                'reviews' => 64,
                'projects' => 98,
                'delivery' => '1 week',
                'rate_toman' => 3800000,
                'rate_usd' => 92,
                'bio_en' => 'Laravel specialist focused on scalable API design and database optimization.',
                'bio_fa' => 'متخصص لاراول متمرکز بر طراحی API مقیاس‌پذیر و بهینه‌سازی پایگاه داده.',
                'active' => true,
                'created_at' => '2024-02-15 00:00:00',
            ],
            [
                'id' => '77777777-7777-4777-8777-777777777777',
                'name_en' => 'Aisha Patel',
                'name_fa' => 'عایشا پاتل',
                'photo' => 'photo-1438761681033-6461ffad8d80',
                'specialty' => 'motion',
                'rating' => 4.7,
                'reviews' => 112,
                'projects' => 210,
                'delivery' => '3 days',
                'rate_toman' => 2800000,
                'rate_usd' => 68,
                'bio_en' => 'Award-winning designer crafting intuitive digital experiences.',
                'bio_fa' => 'طراح برنده جوایز خالق تجربیات دیجیتال شهودی.',
                'active' => true,
                'created_at' => '2024-03-01 00:00:00',
            ],
            [
                'id' => '88888888-8888-4888-8888-888888888888',
                'name_en' => 'David Kim',
                'name_fa' => 'دیوید کیم',
                'photo' => 'photo-1507003211169-0a1dd7228f2d',
                'specialty' => 'thumbnail',
                'rating' => 4.6,
                'reviews' => 47,
                'projects' => 73,
                'delivery' => '2 weeks',
                'rate_toman' => 5200000,
                'rate_usd' => 125,
                'bio_en' => 'Full-stack mobile developer specializing in React Native and Flutter.',
                'bio_fa' => 'توسعه‌دهنده موبایل فول‌استک متخصص در React Native و Flutter.',
                'active' => true,
                'created_at' => '2024-03-20 00:00:00',
            ],
        ];

        foreach ($editors as $editor) {
            $createdAt = $editor['created_at'];
            unset($editor['created_at']);

            Editor::query()->updateOrCreate(['id' => $editor['id']], $editor);
            Editor::whereKey($editor['id'])->update([
                'created_at' => $createdAt,
                'updated_at' => $createdAt,
            ]);
        }
    }
}
