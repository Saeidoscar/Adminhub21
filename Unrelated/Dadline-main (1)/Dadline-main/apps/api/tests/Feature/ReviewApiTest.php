<?php

namespace Tests\Feature;

use App\Models\Review;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ReviewApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name')->default('');
            $table->string('last_name')->default('');
        });

        Schema::create('vendor_profiles', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->string('slug');
            $table->boolean('is_active')->default(true);
        });

        Schema::create('user_profiles', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->primary();
            $table->unsignedBigInteger('avatar_id')->nullable();
        });

        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('reviewer_id');
            $table->unsignedBigInteger('vendor_id');
            $table->string('type');
            $table->unsignedBigInteger('item_id')->default(0);
            $table->unsignedSmallInteger('rate');
            $table->text('review')->nullable();
            $table->string('status')->default('approved');
            $table->timestamp('created_at')->nullable();
        });

        DB::table('users')->insert([
            ['id' => 1, 'first_name' => 'علی', 'last_name' => 'احمدی'],
            ['id' => 2, 'first_name' => 'کاربر', 'last_name' => 'آزمایشی'],
            ['id' => 3, 'first_name' => 'رضا', 'last_name' => 'محمدی'],
        ]);

        DB::table('vendor_profiles')->insert([
            ['user_id' => 1, 'slug' => 'ali-ahmadi', 'is_active' => true],
            ['user_id' => 3, 'slug' => 'reza-mohammadi', 'is_active' => true],
        ]);

        DB::table('user_profiles')->insert([
            ['user_id' => 1, 'avatar_id' => null],
            ['user_id' => 3, 'avatar_id' => null],
        ]);
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('user_profiles');
        Schema::dropIfExists('vendor_profiles');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_public_reviews_returns_only_the_latest_fifty_approved_reviews_with_vendor_data(): void
    {
        foreach (range(1, 51) as $id) {
            $this->createReview($id, vendorId: 1, createdAt: now()->subMinutes(51 - $id));
        }

        $this->createReview(52, vendorId: 1, status: 'hidden', createdAt: now());

        $response = $this->getJson('/v1/reviews');

        $response->assertOk()
            ->assertJsonCount(50, 'data')
            ->assertJsonPath('data.0.id', 51)
            ->assertJsonPath('data.0.rating', 5)
            ->assertJsonPath('data.0.type', 'مشاوره تلفنی')
            ->assertJsonPath('data.0.vendorSlug', 'ali-ahmadi')
            ->assertJsonPath('data.0.vendorName', 'علی احمدی')
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'rating',
                    'review',
                    'type',
                    'vendorAvatar',
                    'vendorSlug',
                    'vendorName',
                    'createdAgo',
                ]],
            ]);
    }

    public function test_vendor_reviews_are_filtered_by_slug_paginated_and_compact(): void
    {
        foreach (range(1, 25) as $id) {
            $this->createReview($id, vendorId: 1, createdAt: now()->subMinutes($id));
        }

        $this->createReview(26, vendorId: 3, createdAt: now());

        $response = $this->getJson('/v1/reviews?vendor=ali-ahmadi&per_page=10');

        $response->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('meta.total', 25)
            ->assertJsonPath('meta.per_page', 10)
            ->assertJsonStructure([
                'data' => [[
                    'id',
                    'rating',
                    'review',
                    'type',
                ]],
                'links',
                'meta',
            ]);

        $this->assertSame(
            ['id', 'rating', 'review', 'type', 'createdAgo'],
            array_keys($response->json('data.0'))
        );
    }

    public function test_unknown_or_inactive_vendor_returns_not_found(): void
    {
        $this->getJson('/v1/reviews?vendor=unknown')->assertNotFound();
    }

    private function createReview(
        int $id,
        int $vendorId,
        string $status = 'approved',
        mixed $createdAt = null
    ): void {
        Review::create([
            'id' => $id,
            'reviewer_id' => 2,
            'vendor_id' => $vendorId,
            'type' => 'phone',
            'item_id' => $id,
            'rate' => 5,
            'review' => "دیدگاه {$id}",
            'status' => $status,
            'created_at' => $createdAt ?? now(),
        ]);
    }
}
