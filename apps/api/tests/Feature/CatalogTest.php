<?php

namespace Tests\Feature;

use App\Models\Editor;
use App\Models\Tool;
use App\Models\VibeCoder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CatalogTest extends TestCase
{
    use RefreshDatabase;

    public function test_tools_are_returned_from_the_database_and_can_be_filtered(): void
    {
        Tool::factory()->create([
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
        ]);
        Tool::factory()->create([
            'id' => '22222222-2222-4222-8222-222222222222',
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
        ]);

        $response = $this->getJson('/api/v1/catalog/tools?category=automation&popular=true&minRating=4.7&search=Laravel');

        $response->assertOk()
            ->assertJsonCount(1, 'tools')
            ->assertJsonPath('tools.0.id', '11111111-1111-4111-8111-111111111111')
            ->assertJsonPath('tools.0.name', 'Laravel Forge');
    }

    public function test_editors_and_vibe_coders_are_returned_from_the_database(): void
    {
        Editor::factory()->create([
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
            'bio_en' => 'Senior frontend architect.',
            'bio_fa' => 'معمار ارشد فرانت‌اند.',
        ]);
        VibeCoder::factory()->create([
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
            'bio_en' => 'Rapid prototyping specialist.',
            'bio_fa' => 'متخصص نمونه‌سازی سریع.',
        ]);

        $this->getJson('/api/v1/catalog/editors?specialty=video')
            ->assertOk()
            ->assertJsonPath('editors.0.nameEn', 'Sarah Chen');

        $this->getJson('/api/v1/catalog/vibe-coders?stack=webApp')
            ->assertOk()
            ->assertJsonPath('vibe-coders.0.nameEn', 'Alex Rivera');
    }
}
