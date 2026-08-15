<?php

namespace Tests\Unit;

use App\Models\Option;
use App\Models\WalletTransactionPayment;
use App\Services\Payments\PaymentGatewayException;
use App\Services\Payments\SepPaymentGateway;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

class SepPaymentGatewayTest extends TestCase
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

    public function test_level_three_token_request_uses_rial_amount_and_identity_snapshot(): void
    {
        $this->configureSep();

        Http::fake([
            'sep.shaparak.ir/OnlinePG/OnlinePG' => Http::response([
                'status' => 1,
                'token' => 'sep-token',
            ]),
        ]);

        $result = app(SepPaymentGateway::class)->initiate(66_000, 'https://dadline.test/payments/1/callback', [
            'payment_id' => 123,
            'mobile' => '09123456789',
            'nationalCode' => '0012345678',
            'enforceCardOwnerNationalCode' => true,
        ]);

        Http::assertSent(function (Request $request): bool {
            $data = $request->data();

            return $request->url() === 'https://sep.shaparak.ir/OnlinePG/OnlinePG'
                && $data['Action'] === 'Token'
                && $data['TerminalId'] === '12571198'
                && $data['Amount'] === 660_000
                && $data['ResNum'] === '123'
                && $data['RedirectUrl'] === 'https://dadline.test/payments/1/callback'
                && $data['CellNumber'] === '09123456789'
                && $data['NationalCode'] === '0012345678'
                && ! array_key_exists('amount', $data);
        });

        $this->assertSame('https://sep.shaparak.ir/OnlinePG/OnlinePG', $result->paymentUrl);
        $this->assertSame('sep-token', $result->token);
        $this->assertSame('12571198', $result->terminalId);
        $this->assertTrue($result->cardOwnerVerificationEnforced);
        $this->assertSame('sep_verify_national_code', $result->cardOwnerVerificationMethod);
    }

    public function test_ordinary_sep_payment_does_not_send_national_code_without_explicit_enforcement(): void
    {
        $this->configureSep();

        Http::fake([
            'sep.shaparak.ir/OnlinePG/OnlinePG' => Http::response([
                'status' => 1,
                'token' => 'sep-token',
            ]),
        ]);

        app(SepPaymentGateway::class)->initiate(50_000, 'https://dadline.test/callback', [
            'payment_id' => 123,
            'mobile' => '09123456789',
            'nationalCode' => '0012345678',
        ]);

        Http::assertSent(function (Request $request): bool {
            $data = $request->data();

            return $request->url() === 'https://sep.shaparak.ir/OnlinePG/OnlinePG'
                && ! array_key_exists('NationalCode', $data)
                && ! array_key_exists('IgnoreNationalcode', $data);
        });
    }

    public function test_level_three_verify_sends_snapshot_and_validates_sep_response(): void
    {
        $this->configureSep();

        Http::fake([
            'sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/VerifyTranscation' => Http::response([
                'Success' => true,
                'ResultCode' => 0,
                'ResultDescription' => 'تراکنش موفق است',
                'TransactionDetail' => [
                    'RefNum' => 'sep-ref-123',
                    'TerminalNumber' => '12571198',
                    'OrginalAmount' => 100_000,
                    'RRN' => '99887766',
                    'MaskedPan' => '603799******1234',
                ],
            ]),
        ]);

        $payment = new WalletTransactionPayment([
            'gateway' => 'sep',
            'amount' => 10_000,
            'terminal_id' => '12571198',
            'request_payload' => [
                'purchase_type' => 'user_verification_level_three',
                'national_code' => '0012345678',
                'mobile' => '09123456789',
                'expected_amount_rial' => 100_000,
                'card_owner_verification_required' => true,
                'gateway_card_owner_verification_enforced' => true,
            ],
        ]);

        $result = app(SepPaymentGateway::class)->verify($payment, [
            'RefNum' => 'sep-ref-123',
        ]);

        Http::assertSent(function (Request $request): bool {
            $data = $request->data();

            return $request->url() === 'https://sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/VerifyTranscation'
                && $data === [
                    'TerminalNumber' => '12571198',
                    'RefNum' => 'sep-ref-123',
                    'CellNumber' => '09123456789',
                    'NationalCode' => '0012345678',
                    'IgnoreNationalcode' => false,
                ];
        });

        $this->assertTrue($result->successful);
        $this->assertTrue($result->ownershipChecked);
        $this->assertSame('sep_verify_national_code', $result->ownershipMethod);
        $this->assertSame(100_000, $result->verifiedAmountRial);
        $this->assertSame('12571198', $result->terminalId);
        $this->assertSame('sep-ref-123', $result->refNum);
    }

    public function test_level_three_verify_rejects_amount_reference_or_terminal_mismatch(): void
    {
        $this->configureSep();

        Http::fake([
            'sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/VerifyTranscation' => Http::response([
                'Success' => true,
                'ResultCode' => 0,
                'TransactionDetail' => [
                    'RefNum' => 'different-ref',
                    'TerminalNumber' => '99999999',
                    'OrginalAmount' => 90_000,
                ],
            ]),
        ]);

        $payment = new WalletTransactionPayment([
            'gateway' => 'sep',
            'amount' => 10_000,
            'terminal_id' => '12571198',
            'request_payload' => [
                'national_code' => '0012345678',
                'mobile' => '09123456789',
                'expected_amount_rial' => 100_000,
                'card_owner_verification_required' => true,
            ],
        ]);

        $result = app(SepPaymentGateway::class)->verify($payment, [
            'RefNum' => 'sep-ref-123',
        ]);

        $this->assertFalse($result->successful);
        $this->assertFalse($result->ownershipChecked);
        $this->assertSame('verified_amount_mismatch', $result->failureReason);
        $this->assertSame([
            'verified_amount_mismatch',
            'verified_ref_num_mismatch',
            'verified_terminal_mismatch',
        ], $result->payload['_dadline_verification']['validation_errors']);
    }

    public function test_failed_token_request_is_retryable_for_smart_fallback(): void
    {
        $this->configureSep();

        Http::fake([
            'sep.shaparak.ir/OnlinePG/OnlinePG' => Http::response([
                'status' => -1,
                'errorCode' => 8,
                'errorDesc' => 'آدرس سرور پذیرنده نامعتبر است',
            ]),
        ]);

        try {
            app(SepPaymentGateway::class)->initiate(50_000, 'https://dadline.net/v1/payments/sep/callback');
            $this->fail('Expected SEP token initiation to fail.');
        } catch (PaymentGatewayException $exception) {
            $this->assertTrue($exception->retryable);
            $this->assertStringContainsString('errorCode=8', $exception->getMessage());
        }
    }

    private function configureSep(): void
    {
        Option::set('payment_sep_enabled', '1', 'payment');
        Option::set('payment_sep_request_url', 'https://sep.shaparak.ir/OnlinePG/OnlinePG', 'payment');
        Option::set('payment_sep_verify_url', 'https://sep.shaparak.ir/verifyTxnRandomSessionkey/ipg/VerifyTranscation', 'payment');
        Option::set('payment_sep_terminal_id', '12571198', 'payment');
    }
}
