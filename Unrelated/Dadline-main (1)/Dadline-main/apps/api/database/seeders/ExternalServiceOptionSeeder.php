<?php

namespace Database\Seeders;

use App\Models\Option;
use Illuminate\Database\Seeder;

class ExternalServiceOptionSeeder extends Seeder
{
    public function run(): void
    {
        $options = [
            'zibal_ebank_enabled' => ['group' => 'external_services', 'value' => '0'],
            'zibal_ebank_base_url' => ['group' => 'external_services', 'value' => 'https://api.zibal.ir'],
            'zibal_ebank_access_token' => ['group' => 'external_services', 'value' => ''],
            'zibal_ebank_account_id' => ['group' => 'external_services', 'value' => ''],
            'zibal_ebank_reason_code' => ['group' => 'external_services', 'value' => '4'],
            'zibal_ebank_timeout_seconds' => ['group' => 'external_services', 'value' => '15'],
            'zibal_ebank_inquiry_interval_minutes' => ['group' => 'external_services', 'value' => '10'],
            'zibal_ebank_callback_url' => ['group' => 'external_services', 'value' => ''],
            'zibal_ebank_webhook_token' => ['group' => 'external_services', 'value' => ''],

            'api_ir_enabled' => ['group' => 'external_services', 'value' => '0'],
            'api_ir_base_url' => ['group' => 'external_services', 'value' => 'https://p.api.ir', 'replace_blank' => true],
            'api_ir_api_key' => ['group' => 'external_services', 'value' => ''],
            'api_ir_timeout_seconds' => ['group' => 'external_services', 'value' => '15'],
            'api_ir_connect_timeout_seconds' => ['group' => 'external_services', 'value' => '5'],
            'api_ir_retryable_codes' => ['group' => 'external_services', 'value' => '408,429,500,502,503,504'],
            'api_ir_non_billable_http_statuses' => ['group' => 'external_services', 'value' => '401,403,404,405,408,429,500,502,503,504'],
            'api_ir_non_billable_codes' => ['group' => 'external_services', 'value' => '401,403,408,429,500,502,503,504'],

            'api_ir_identity_enabled' => ['group' => 'external_services', 'value' => '1'],
            'api_ir_level_one_lite_enabled' => ['group' => 'external_services', 'value' => '1'],
            'api_ir_level_one_lite_endpoint' => ['group' => 'external_services', 'value' => '/api/sw1/ShahkarLite'],
            'api_ir_level_one_pro_enabled' => ['group' => 'external_services', 'value' => '1'],
            'api_ir_level_one_pro_endpoint' => ['group' => 'external_services', 'value' => '/api/sw1/ShahkarPro'],
            'api_ir_level_two_endpoint' => ['group' => 'external_services', 'value' => '/api/sw1/PersonInfo'],

            'api_ir_bank_enabled' => ['group' => 'external_services', 'value' => '1'],
            'api_ir_iban_match_endpoint' => ['group' => 'external_services', 'value' => '/api/sw1/IbanMatch'],

            'api_ir_sms_otp_enabled' => ['group' => 'external_services', 'value' => '1'],
            'api_ir_sms_otp_endpoint' => ['group' => 'external_services', 'value' => '/api/sw1/SmsOTP'],
            'api_ir_sms_otp_template' => ['group' => 'external_services', 'value' => '1'],

            'api_ir_call_otp_enabled' => ['group' => 'external_services', 'value' => '1'],
            'api_ir_call_otp_endpoint' => ['group' => 'external_services', 'value' => '/api/sw1/CallOTP'],
            'api_ir_call_otp_alt_enabled' => ['group' => 'external_services', 'value' => '1'],
            'api_ir_call_otp_alt_endpoint' => ['group' => 'external_services', 'value' => '/api/sw1/CallOTPalt'],

            'sms_provider_mode' => ['group' => 'notifications', 'value' => 'smart'],
            'sms_otp_pattern_fallback_enabled' => ['group' => 'notifications', 'value' => '1'],

            'melipayamak_enabled' => ['group' => 'notifications', 'value' => '0'],
            'melipayamak_username' => ['group' => 'notifications', 'value' => ''],
            'melipayamak_api_key' => ['group' => 'notifications', 'value' => ''],
            'melipayamak_password' => ['group' => 'notifications', 'value' => ''],
            'melipayamak_send_by_base_number_url' => ['group' => 'notifications', 'value' => 'http://api.payamak-panel.com/post/Send.asmx', 'replace_blank' => true],
            'melipayamak_timeout_seconds' => ['group' => 'notifications', 'value' => '20'],
            'melipayamak_connect_timeout_seconds' => ['group' => 'notifications', 'value' => '5'],
            'adly_enabled' => ['group' => 'notifications', 'value' => '0'],
            'adly_api_url' => ['group' => 'notifications', 'value' => 'https://mydnspanel.com/webservice/server', 'replace_blank' => true],
            'adly_api_key' => ['group' => 'notifications', 'value' => ''],
            'adly_sender' => ['group' => 'notifications', 'value' => ''],
            'adly_pattern_sender' => ['group' => 'notifications', 'value' => ''],
            'adly_timeout_seconds' => ['group' => 'notifications', 'value' => '20'],
            'adly_connect_timeout_seconds' => ['group' => 'notifications', 'value' => '5'],

            'verify_iban_cost' => ['group' => 'pricing', 'value' => '0'],
            'verify_level_three_deposit_amount' => ['group' => 'pricing', 'value' => '10000'],

            'telegram_bot_enabled' => ['group' => 'notifications', 'value' => '0'],
            'telegram_bot_token' => ['group' => 'notifications', 'value' => ''],
            'telegram_bot_api_base_url' => ['group' => 'notifications', 'value' => 'https://api.telegram.org', 'replace_blank' => true],
            'telegram_bot_relay_enabled' => ['group' => 'notifications', 'value' => '0'],
            'telegram_bot_relay_url' => ['group' => 'notifications', 'value' => ''],
            'telegram_bot_relay_secret' => ['group' => 'notifications', 'value' => ''],
            'telegram_bot_relay_fallback_enabled' => ['group' => 'notifications', 'value' => '0'],
            'telegram_bot_default_chat_id' => ['group' => 'notifications', 'value' => ''],
            'telegram_bot_parse_mode' => ['group' => 'notifications', 'value' => ''],
            'telegram_bot_disable_notification' => ['group' => 'notifications', 'value' => '0'],
            'telegram_bot_disable_link_preview' => ['group' => 'notifications', 'value' => '1'],
            'telegram_bot_timeout_seconds' => ['group' => 'notifications', 'value' => '20'],
            'telegram_bot_connect_timeout_seconds' => ['group' => 'notifications', 'value' => '8'],
            'telegram_bot_proxy_enabled' => ['group' => 'notifications', 'value' => '1'],
            // Supported formats: http://user:pass@host:port and socks5h://user:pass@host:port.
            'telegram_bot_proxies' => ['group' => 'notifications', 'value' => []],
            'telegram_bot_max_proxy_attempts' => ['group' => 'notifications', 'value' => '0'],
            'telegram_bot_proxy_failure_ttl_seconds' => ['group' => 'notifications', 'value' => '300'],
            'telegram_bot_direct_fallback_enabled' => ['group' => 'notifications', 'value' => '0'],

            'bale_bot_enabled' => ['group' => 'notifications', 'value' => '0'],
            'bale_bot_token' => ['group' => 'notifications', 'value' => ''],
            'bale_bot_api_base_url' => ['group' => 'notifications', 'value' => 'https://tapi.bale.ai', 'replace_blank' => true],
            'bale_bot_default_chat_id' => ['group' => 'notifications', 'value' => ''],
            'bale_bot_timeout_seconds' => ['group' => 'notifications', 'value' => '20'],
            'bale_bot_connect_timeout_seconds' => ['group' => 'notifications', 'value' => '5'],

            'bale_safir_enabled' => ['group' => 'notifications', 'value' => '0'],
            'bale_safir_api_url' => ['group' => 'notifications', 'value' => 'https://safir.bale.ai/api/v3/send_message', 'replace_blank' => true],
            'bale_safir_api_access_key' => ['group' => 'notifications', 'value' => ''],
            'bale_safir_bot_id' => ['group' => 'notifications', 'value' => ''],
            'bale_safir_timeout_seconds' => ['group' => 'notifications', 'value' => '20'],
            'bale_safir_connect_timeout_seconds' => ['group' => 'notifications', 'value' => '5'],

            'legal_questions_public_base_url' => ['group' => 'notifications', 'value' => 'https://dadline.net/questions', 'replace_blank' => true],
            'legal_questions_telegram_enabled' => ['group' => 'notifications', 'value' => '1'],
            'legal_questions_channel_telegram_chat_id' => ['group' => 'notifications', 'value' => '-1002303257757', 'replace_blank' => true],

            'legal_questions_bale_enabled' => ['group' => 'notifications', 'value' => '0'],
            'legal_questions_channel_bale_chat_id' => ['group' => 'notifications', 'value' => ''],

            'legal_questions_eitaa_enabled' => ['group' => 'notifications', 'value' => '1'],
            'eitaa_app_token' => ['group' => 'notifications', 'value' => ''],
            'eitaa_app_api_url' => ['group' => 'notifications', 'value' => 'https://eitaayar.ir/api/app/sendMessage', 'replace_blank' => true],
            'eitaa_token_bot' => ['group' => 'notifications', 'value' => ''],
            'eitaa_bot_api_base_url' => ['group' => 'notifications', 'value' => 'https://eitaayar.ir/api', 'replace_blank' => true],
            'eitaa_bot_account_id' => ['group' => 'notifications', 'value' => '11017928', 'replace_blank' => true],
            'legal_questions_channel_eitaaid' => ['group' => 'notifications', 'value' => '11040164', 'replace_blank' => true],
            'eitaa_timeout_seconds' => ['group' => 'notifications', 'value' => '30'],
            'eitaa_connect_timeout_seconds' => ['group' => 'notifications', 'value' => '5'],

        ];

        foreach ($options as $key => $option) {
            $existing = Option::query()->where('key', $key)->first();

            if ($existing !== null) {
                if (($option['replace_blank'] ?? false) && blank($existing->value)) {
                    Option::set($key, $option['value'], $option['group']);
                }

                continue;
            }

            Option::set(
                $key,
                $option['value'],
                $option['group'],
            );
        }
    }
}
