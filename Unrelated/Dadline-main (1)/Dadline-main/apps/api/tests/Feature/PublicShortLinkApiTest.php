<?php

namespace Tests\Feature;

use App\Models\ShortLink;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PublicShortLinkApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('short_links', function (Blueprint $table): void {
            $table->id();
            $table->string('short_code', 10)->unique();
            $table->text('original_url')->unique();
            $table->unsignedBigInteger('clicks')->default(0);
            $table->timestampTz('created_at')->useCurrent();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('short_links');

        parent::tearDown();
    }

    public function test_short_link_is_resolved_and_click_is_incremented(): void
    {
        $shortLink = ShortLink::query()->create([
            'short_code' => 'Ab12Cd',
            'original_url' => 'https://dadline.net/lawyer/example',
            'clicks' => 7,
        ]);

        $this->postJson('/v1/public/short-links/Ab12Cd/resolve')
            ->assertOk()
            ->assertExactJson([
                'data' => [
                    'original_url' => 'https://dadline.net/lawyer/example',
                ],
            ]);

        $this->assertSame(8, $shortLink->fresh()->clicks);
    }

    public function test_each_resolution_increments_the_click_counter(): void
    {
        $shortLink = ShortLink::query()->create([
            'short_code' => 'counter1',
            'original_url' => 'https://dadline.net/questions',
        ]);

        $this->postJson('/v1/public/short-links/counter1/resolve')->assertOk();
        $this->postJson('/v1/public/short-links/counter1/resolve')->assertOk();

        $this->assertSame(2, $shortLink->fresh()->clicks);
    }

    public function test_unknown_or_malformed_short_code_returns_not_found(): void
    {
        $this->postJson('/v1/public/short-links/missing/resolve')
            ->assertNotFound();

        $this->postJson('/v1/public/short-links/not-valid!/resolve')
            ->assertNotFound();
    }

    public function test_unsafe_destination_is_not_returned_or_counted(): void
    {
        $shortLink = ShortLink::query()->create([
            'short_code' => 'unsafe1',
            'original_url' => 'javascript:alert(1)',
            'clicks' => 3,
        ]);

        $this->postJson('/v1/public/short-links/unsafe1/resolve')
            ->assertNotFound();

        $this->assertSame(3, $shortLink->fresh()->clicks);
    }

    public function test_model_generates_a_unique_six_character_short_code(): void
    {
        $first = ShortLink::findOrCreateForUrl('/lawyer/first');
        $second = ShortLink::findOrCreateForUrl('/lawyer/second');

        $this->assertMatchesRegularExpression(
            '/^[A-Za-z0-9]{6}$/',
            $first->short_code
        );
        $this->assertMatchesRegularExpression(
            '/^[A-Za-z0-9]{6}$/',
            $second->short_code
        );
        $this->assertNotSame($first->short_code, $second->short_code);
    }

    public function test_model_returns_the_existing_short_link_for_a_duplicate_url(): void
    {
        $first = ShortLink::findOrCreateForUrl('/question/example');
        $second = ShortLink::findOrCreateForUrl('/question/example');

        $this->assertTrue($first->is($second));
        $this->assertDatabaseCount('short_links', 1);
    }

    public function test_public_endpoint_creates_and_reuses_a_short_link(): void
    {
        $firstResponse = $this->postJson('/v1/public/short-links', [
            'original_url' => '/lawyer/example?source=share#contact',
        ])->assertCreated();

        $shortCode = $firstResponse->json('data.short_code');

        $this->assertIsString($shortCode);
        $this->assertMatchesRegularExpression('/^[A-Za-z0-9]{6}$/', $shortCode);

        $this->postJson('/v1/public/short-links', [
            'original_url' => '/lawyer/example?source=share#contact',
        ])
            ->assertOk()
            ->assertJsonPath('data.short_code', $shortCode);

        $this->assertDatabaseCount('short_links', 1);
    }

    public function test_public_endpoint_only_accepts_internal_paths(): void
    {
        foreach ([
            'https://dadline.net/lawyer/example',
            '//example.com/path',
            'lawyer/example',
            '',
        ] as $invalidUrl) {
            $this->postJson('/v1/public/short-links', [
                'original_url' => $invalidUrl,
            ])
                ->assertUnprocessable()
                ->assertJsonValidationErrors('original_url');
        }

        $this->assertDatabaseCount('short_links', 0);
    }
}
