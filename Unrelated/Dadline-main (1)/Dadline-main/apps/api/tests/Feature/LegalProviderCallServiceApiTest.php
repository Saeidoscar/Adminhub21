<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\OnlineUserService;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Mockery\MockInterface;
use Tests\TestCase;

class LegalProviderCallServiceApiTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $this->buildSchema();

        $this->mock(OnlineUserService::class, function (MockInterface $mock): void {
            $mock->shouldReceive('markOnline')->zeroOrMoreTimes();
            $mock->shouldReceive('isOnline')->andReturnFalse()->zeroOrMoreTimes();
            $mock->shouldReceive('lastSeen')->andReturnNull()->zeroOrMoreTimes();
            $mock->shouldReceive('onlineIds')->andReturn([])->zeroOrMoreTimes();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('user_legal_categories');
        Schema::dropIfExists('legal_categories');
        Schema::dropIfExists('user_profiles');
        Schema::dropIfExists('reviews');
        Schema::dropIfExists('vendor_services');
        Schema::dropIfExists('vendor_profiles');
        Schema::dropIfExists('users');

        parent::tearDown();
    }

    public function test_call_service_filter_only_returns_enabled_providers_with_pagination(): void
    {
        $lawyer = $this->createProvider(
            mobile: '09120000001',
            slug: 'enabled-lawyer',
            type: 'lawyer',
            role: 'lawyer_judicial',
            lastLoginAt: now(),
        );
        $this->createService($lawyer, 'call', true, null, [
            'prices' => ['10' => 120000, '20' => 210000],
        ]);
        $this->createReview($lawyer, 5, 'approved');
        $this->createReview($lawyer, 3, 'approved');
        $this->createReview($lawyer, 1, 'rejected');

        $expert = $this->createProvider(
            mobile: '09120000002',
            slug: 'enabled-expert',
            type: 'expert',
            role: 'legal_expert',
            lastLoginAt: now()->subMinute(),
        );
        $this->createService($expert, 'call', true, 95000);

        $disabled = $this->createProvider(
            mobile: '09120000003',
            slug: 'disabled-call',
            type: 'lawyer',
            role: 'lawyer_judicial',
            lastLoginAt: now()->subMinutes(2),
        );
        $this->createService($disabled, 'call', false, 50000);

        $documentOnly = $this->createProvider(
            mobile: '09120000004',
            slug: 'document-only',
            type: 'lawyer',
            role: 'lawyer_judicial',
            lastLoginAt: now()->subMinutes(3),
        );
        $this->createService($documentOnly, 'document', true, 300000);

        $this->getJson('/v1/legal-providers?service=call&per_page=1&page=1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'enabled-lawyer')
            ->assertJsonPath('data.0.service.type', 'call')
            ->assertJsonPath('data.0.service.startingPrice', 120000)
            ->assertJsonPath('data.0.rating', 4)
            ->assertJsonPath('data.0.reviewCount', 2)
            ->assertJsonPath('meta.current_page', 1)
            ->assertJsonPath('meta.last_page', 2)
            ->assertJsonPath('meta.total', 2);

        $this->getJson('/v1/legal-providers?service=call&type=expert&per_page=12')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'enabled-expert')
            ->assertJsonPath('data.0.service.startingPrice', 95000);

        $this->getJson('/v1/legal-providers?service=call&online=true')
            ->assertOk();
    }

    private function createProvider(
        string $mobile,
        string $slug,
        string $type,
        string $role,
        mixed $lastLoginAt,
    ): User {
        $user = User::query()->create([
            'mobile' => $mobile,
            'first_name' => 'Test',
            'last_name' => $slug,
            'role' => $role,
            'is_vendor' => true,
            'last_login_at' => $lastLoginAt,
        ]);

        $user->vendorProfile()->create([
            'slug' => $slug,
            'vendor_type' => $type,
            'is_active' => true,
        ]);

        return $user;
    }

    private function createService(
        User $user,
        string $service,
        bool $enabled,
        ?int $price,
        ?array $settings = null,
    ): void {
        $user->vendorServices()->create([
            'service' => $service,
            'enabled' => $enabled,
            'price' => $price,
            'settings' => $settings,
        ]);
    }

    private function createReview(User $vendor, int $rate, string $status): void
    {
        $vendor->reviewsReceived()->create([
            'reviewer_id' => $vendor->getKey(),
            'type' => 'phone',
            'rate' => $rate,
            'status' => $status,
        ]);
    }

    private function buildSchema(): void
    {
        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('mobile')->unique();
            $table->string('email')->nullable();
            $table->string('password')->nullable();
            $table->string('remember_token')->nullable();
            $table->string('first_name')->default('');
            $table->string('last_name')->default('');
            $table->string('role')->default('user');
            $table->boolean('is_vendor')->default(false);
            $table->timestamp('registered_at')->nullable();
            $table->timestamp('last_login_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        Schema::create('vendor_profiles', function (Blueprint $table): void {
            $table->foreignId('user_id')->primary();
            $table->string('slug')->nullable();
            $table->string('vendor_type')->default('lawyer');
            $table->json('documents')->nullable();
            $table->json('profile')->nullable();
            $table->json('license')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('vendor_services', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id');
            $table->string('service');
            $table->boolean('enabled')->default(true);
            $table->unsignedBigInteger('price')->nullable();
            $table->json('settings')->nullable();
            $table->unsignedInteger('sort')->default(0);
            $table->timestamps();
        });

        Schema::create('reviews', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('reviewer_id');
            $table->foreignId('vendor_id');
            $table->string('type');
            $table->unsignedBigInteger('item_id')->default(0);
            $table->unsignedBigInteger('rate');
            $table->text('review')->nullable();
            $table->string('status')->nullable()->default('approved');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('user_profiles', function (Blueprint $table): void {
            $table->foreignId('user_id')->primary();
            $table->unsignedBigInteger('city_id')->nullable();
            $table->unsignedBigInteger('avatar_id')->nullable();
            $table->timestamps();
        });

        Schema::create('legal_categories', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->string('name');
            $table->string('slug')->unique();
        });

        Schema::create('user_legal_categories', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id');
            $table->foreignId('legal_category_id');
        });
    }
}
