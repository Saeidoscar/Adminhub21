<?php

namespace Tests\Feature;

use App\Models\Option;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PublicPricingApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('options', function (Blueprint $table): void {
            $table->id();
            $table->string('group', 100)->default('general')->index();
            $table->string('key', 191)->unique();
            $table->json('value');
            $table->boolean('autoload')->default(false);
            $table->timestamps();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('options');

        parent::tearDown();
    }

    public function test_public_pricing_only_returns_whitelisted_available_prices(): void
    {
        Option::query()->create([
            'group' => 'pricing',
            'key' => 'phone_counseling_20',
            'value' => '210000',
        ]);
        Option::query()->create([
            'group' => 'pricing',
            'key' => 'doc_petition',
            'value' => '600000',
        ]);
        Option::query()->create([
            'group' => 'pricing',
            'key' => 'vendor_share',
            'value' => '0.8',
        ]);

        $response = $this->getJson('/v1/public/pricing')
            ->assertOk()
            ->assertJsonPath('data.currency', 'IRT')
            ->assertJsonPath('data.currency_label', 'تومان')
            ->assertJsonPath('data.groups.0.key', 'consultation')
            ->assertJsonPath('data.groups.0.items.0.key', 'phone_counseling_20')
            ->assertJsonPath('data.groups.0.items.0.price', 210000)
            ->assertJsonPath('data.groups.1.key', 'documents')
            ->assertJsonPath('data.groups.1.items.0.key', 'doc_petition');

        $payload = $response->json();
        $keys = collect($payload['data']['groups'])
            ->flatMap(fn (array $group): array => array_column($group['items'], 'key'));

        $this->assertFalse($keys->contains('vendor_share'));
        $this->assertFalse($keys->contains('phone_counseling_10'));
    }
}
