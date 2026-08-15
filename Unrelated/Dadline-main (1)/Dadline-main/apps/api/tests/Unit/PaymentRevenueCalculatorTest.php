<?php

namespace Tests\Unit;

use App\Enums\UserSubscriptionPlan;
use App\Models\Option;
use App\Models\User;
use App\Models\UserSubscription;
use App\Services\Purchases\PlatformRevenueCalculator;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class PaymentRevenueCalculatorTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        Schema::create('options', function (Blueprint $table): void {
            $table->id();
            $table->string('group')->default('general');
            $table->string('key')->unique();
            $table->json('value');
            $table->boolean('autoload')->default(false);
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('mobile')->unique();
            $table->string('first_name')->default('');
            $table->string('last_name')->default('');
            $table->string('role')->default('user');
            $table->boolean('is_vendor')->default(false);
            $table->timestamps();
        });

        Schema::create('user_subscriptions', function (Blueprint $table): void {
            $table->unsignedBigInteger('user_id')->primary();
            $table->string('plan')->default('freemium');
            $table->timestamp('expires_at')->nullable();
        });
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('user_subscriptions');
        Schema::dropIfExists('users');
        Schema::dropIfExists('options');

        parent::tearDown();
    }

    public function test_vendor_share_options_are_inverted_to_platform_commission(): void
    {
        Option::set('vendor_share', '0.7', 'pricing');
        Option::set('pro_vendor_share', '0.8', 'pricing');
        Option::set('vat_percent', '0.1', 'pricing');

        $vendor = User::query()->create(['mobile' => '09120000001']);

        $breakdown = app(PlatformRevenueCalculator::class)->forVendorPurchase(1_000_000, $vendor);

        $this->assertSame(300_000, $breakdown->grossCommission);
        $this->assertSame(272_727, $breakdown->netIncome);
        $this->assertSame(27_273, $breakdown->vatAmount);
        $this->assertSame(700_000, $breakdown->vendorShare);
    }

    public function test_active_premium_vendor_uses_pro_vendor_share(): void
    {
        Option::set('vendor_share', '0.7', 'pricing');
        Option::set('pro_vendor_share', '0.8', 'pricing');
        Option::set('vat_percent', '0.1', 'pricing');

        $vendor = User::query()->create(['mobile' => '09120000002']);
        UserSubscription::query()->create([
            'user_id' => $vendor->id,
            'plan' => UserSubscriptionPlan::Premium,
            'expires_at' => now()->addMonth(),
        ]);

        $breakdown = app(PlatformRevenueCalculator::class)->forVendorPurchase(1_000_000, $vendor->refresh());

        $this->assertSame(200_000, $breakdown->grossCommission);
        $this->assertSame(181_818, $breakdown->netIncome);
        $this->assertSame(18_182, $breakdown->vatAmount);
        $this->assertSame(800_000, $breakdown->vendorShare);
    }
}
