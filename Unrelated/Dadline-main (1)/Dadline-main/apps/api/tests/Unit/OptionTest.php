<?php

namespace Tests\Unit;

use App\Models\Option;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class OptionTest extends TestCase
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
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('options');

        parent::tearDown();
    }

    public function test_get_returns_cast_scalar_value_from_json_column(): void
    {
        DB::table('options')->insert([
            'group' => 'payment',
            'key' => 'payment_sep_terminal_id',
            'value' => json_encode('15272525'),
            'autoload' => false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Cache::forget('option:payment_sep_terminal_id');

        $this->assertSame('15272525', Option::get('payment_sep_terminal_id'));
    }
}
