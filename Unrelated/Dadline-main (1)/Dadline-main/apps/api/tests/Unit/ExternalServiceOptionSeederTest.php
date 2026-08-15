<?php

namespace Tests\Unit;

use App\Models\Option;
use Database\Seeders\ExternalServiceOptionSeeder;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ExternalServiceOptionSeederTest extends TestCase
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

    public function test_it_creates_required_keys_without_overwriting_existing_secrets(): void
    {
        Option::set('zibal_ebank_access_token', 'production-secret', 'external_services');
        Option::set('api_ir_api_key', 'api-ir-production-secret', 'external_services');
        Option::set('telegram_bot_token', 'telegram-production-secret', 'notifications');
        Option::set('telegram_bot_relay_secret', 'relay-production-secret', 'notifications');
        Option::set('telegram_bot_proxies', ['socks5h://proxy.example.test:1080'], 'notifications');
        Option::set('eitaa_token_bot', 'eitaa-production-secret', 'notifications');
        Option::set('bale_bot_token', 'bale-production-secret', 'notifications');
        Option::set('bale_safir_api_access_key', 'bale-safir-production-secret', 'notifications');
        Option::set('melipayamak_api_key', 'melipayamak-production-secret', 'notifications');
        Option::set('adly_api_key', 'adly-production-secret', 'notifications');

        app(ExternalServiceOptionSeeder::class)->run();

        $this->assertSame('production-secret', Option::get('zibal_ebank_access_token'));
        $this->assertSame('https://api.zibal.ir', Option::get('zibal_ebank_base_url'));
        $this->assertSame('api-ir-production-secret', Option::get('api_ir_api_key'));
        $this->assertSame('https://p.api.ir', Option::get('api_ir_base_url'));
        $this->assertSame('1', Option::get('api_ir_level_one_lite_enabled'));
        $this->assertSame('/api/sw1/ShahkarLite', Option::get('api_ir_level_one_lite_endpoint'));
        $this->assertSame('1', Option::get('api_ir_level_one_pro_enabled'));
        $this->assertSame('/api/sw1/ShahkarPro', Option::get('api_ir_level_one_pro_endpoint'));
        $this->assertSame('/api/sw1/PersonInfo', Option::get('api_ir_level_two_endpoint'));
        $this->assertSame('/api/sw1/IbanMatch', Option::get('api_ir_iban_match_endpoint'));
        $this->assertSame('/api/sw1/SmsOTP', Option::get('api_ir_sms_otp_endpoint'));
        $this->assertSame('/api/sw1/CallOTP', Option::get('api_ir_call_otp_endpoint'));
        $this->assertSame('smart', Option::get('sms_provider_mode'));
        $this->assertSame('1', Option::get('sms_otp_pattern_fallback_enabled'));
        $this->assertSame('0', Option::get('melipayamak_enabled'));
        $this->assertSame('melipayamak-production-secret', Option::get('melipayamak_api_key'));
        $this->assertSame('http://api.payamak-panel.com/post/Send.asmx', Option::get('melipayamak_send_by_base_number_url'));
        $this->assertSame('0', Option::get('adly_enabled'));
        $this->assertSame('https://mydnspanel.com/webservice/server', Option::get('adly_api_url'));
        $this->assertSame('adly-production-secret', Option::get('adly_api_key'));
        $this->assertSame('', Option::get('adly_sender'));
        $this->assertSame('', Option::get('adly_pattern_sender'));
        $this->assertSame('15', Option::get('api_ir_timeout_seconds'));
        $this->assertSame(
            '401,403,404,405,408,429,500,502,503,504',
            Option::get('api_ir_non_billable_http_statuses'),
        );
        $this->assertSame('0', Option::get('verify_iban_cost'));
        $this->assertSame('10000', Option::get('verify_level_three_deposit_amount'));
        $this->assertSame('telegram-production-secret', Option::get('telegram_bot_token'));
        $this->assertSame('https://api.telegram.org', Option::get('telegram_bot_api_base_url'));
        $this->assertSame('0', Option::get('telegram_bot_relay_enabled'));
        $this->assertSame('', Option::get('telegram_bot_relay_url'));
        $this->assertSame('relay-production-secret', Option::get('telegram_bot_relay_secret'));
        $this->assertSame('0', Option::get('telegram_bot_relay_fallback_enabled'));
        $this->assertSame(['socks5h://proxy.example.test:1080'], Option::get('telegram_bot_proxies'));
        $this->assertSame('1', Option::get('telegram_bot_proxy_enabled'));
        $this->assertSame('0', Option::get('telegram_bot_direct_fallback_enabled'));
        $this->assertSame('bale-production-secret', Option::get('bale_bot_token'));
        $this->assertSame('https://tapi.bale.ai', Option::get('bale_bot_api_base_url'));
        $this->assertSame('0', Option::get('bale_bot_enabled'));
        $this->assertSame('bale-safir-production-secret', Option::get('bale_safir_api_access_key'));
        $this->assertSame('https://safir.bale.ai/api/v3/send_message', Option::get('bale_safir_api_url'));
        $this->assertSame('0', Option::get('bale_safir_enabled'));
        $this->assertSame('https://dadline.net/questions', Option::get('legal_questions_public_base_url'));
        $this->assertSame('1', Option::get('legal_questions_telegram_enabled'));
        $this->assertSame('-1002303257757', Option::get('legal_questions_channel_telegram_chat_id'));
        $this->assertSame('0', Option::get('legal_questions_bale_enabled'));
        $this->assertSame('', Option::get('legal_questions_channel_bale_chat_id'));
        $this->assertSame('1', Option::get('legal_questions_eitaa_enabled'));
        $this->assertSame('eitaa-production-secret', Option::get('eitaa_token_bot'));
        $this->assertSame('https://eitaayar.ir/api', Option::get('eitaa_bot_api_base_url'));
        $this->assertSame('11017928', Option::get('eitaa_bot_account_id'));
        $this->assertSame('11040164', Option::get('legal_questions_channel_eitaaid'));
    }
}
