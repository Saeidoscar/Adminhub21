<?php

namespace Tests\Unit;

use App\Models\Option;
use App\Models\PayoutSettlement;
use App\Services\ExternalServices\Zibal\ZibalEbankPayoutProvider;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class ZibalEbankPayoutProviderTest extends TestCase
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

        Option::set('zibal_ebank_enabled', '1', 'external_services');
        Option::set('zibal_ebank_base_url', 'https://api.zibal.test', 'external_services');
        Option::set('zibal_ebank_access_token', 'secret-token', 'external_services');
        Option::set('zibal_ebank_account_id', 'account-123', 'external_services');
        Option::set('zibal_ebank_reason_code', '4', 'external_services');
        Option::set('zibal_ebank_callback_url', 'https://dadline.test/v1/webhooks/zibal/ebank/token', 'external_services');
    }

    protected function tearDown(): void
    {
        Schema::dropIfExists('options');

        parent::tearDown();
    }

    public function test_submit_uses_bearer_token_rial_amount_and_stable_unique_code(): void
    {
        Http::fake([
            'api.zibal.test/ebank/v1/account/checkout/create/' => Http::response([
                'result' => 1,
                'message' => 'موفق',
                'data' => [
                    'trackerId' => '19',
                    'receipt' => 'https://r.zib.al/ec/TiRCNJ',
                    'uniqueCode' => 'settlement-uuid',
                    'checkouts' => [
                        ['status' => 0],
                    ],
                ],
            ]),
        ]);

        $settlement = new PayoutSettlement([
            'amount' => 100_000,
            'fee' => 5_500,
            'total_payable' => 94_500,
            'iban' => 'ir030170000565276560000001',
            'unique_code' => 'settlement-uuid',
        ]);
        $settlement->id = 77;

        $result = app(ZibalEbankPayoutProvider::class)->submit($settlement);

        Http::assertSent(function ($request): bool {
            $data = $request->data();

            return $request->url() === 'https://api.zibal.test/ebank/v1/account/checkout/create/'
                && $request->hasHeader('Authorization', 'Bearer secret-token')
                && $data['amount'] === 945_000
                && $data['iban'] === 'IR030170000565276560000001'
                && $data['accountId'] === 'account-123'
                && $data['reasonCode'] === 4
                && $data['delay'] === -1
                && $data['uniqueCode'] === 'settlement-uuid'
                && $data['callbackUrl'] === 'https://dadline.test/v1/webhooks/zibal/ebank/token';
        });

        $this->assertSame(0, $result->status);
        $this->assertSame('19', $result->trackerId);
        $this->assertSame('https://r.zib.al/ec/TiRCNJ', $result->receiptLink);
    }

    public function test_inquiry_prefers_tracker_id_over_unique_code(): void
    {
        Http::fake([
            'api.zibal.test/ebank/v1/account/checkout/inquire/*' => Http::response([
                'result' => 1,
                'data' => [
                    'trackerId' => '19',
                    'checkouts' => [
                        ['status' => 0],
                    ],
                ],
            ]),
        ]);

        $settlement = new PayoutSettlement([
            'unique_code' => 'settlement-uuid',
            'track_id' => '19',
        ]);

        app(ZibalEbankPayoutProvider::class)->inquire($settlement);

        Http::assertSent(function ($request): bool {
            parse_str((string) parse_url($request->url(), PHP_URL_QUERY), $query);

            return parse_url($request->url(), PHP_URL_PATH) === '/ebank/v1/account/checkout/inquire/'
                && $query === [
                    'accountId' => 'account-123',
                    'trackerId' => '19',
                ];
        });
    }

    public function test_webhook_mapper_accepts_snake_case_payload(): void
    {
        $provider = app(ZibalEbankPayoutProvider::class);
        $payload = [
            'data' => [
                'tracker_id' => '155',
                'unique_code' => 'abc-123',
                'receipt' => 'https://r.zib.al/ec/example',
                'checkouts' => [
                    ['status' => 3],
                ],
            ],
        ];

        $result = $provider->fromWebhook($payload);

        $this->assertSame('abc-123', $provider->uniqueCodeFromPayload($payload));
        $this->assertSame('155', $provider->trackerIdFromPayload($payload));
        $this->assertSame(3, $result->status);
    }
}
