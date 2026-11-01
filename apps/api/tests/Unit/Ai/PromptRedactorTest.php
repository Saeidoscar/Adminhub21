<?php

namespace Tests\Unit\Ai;

use App\Services\Ai\Guardrails\PromptRedactor;
use Tests\TestCase;

class PromptRedactorTest extends TestCase
{
    private PromptRedactor $redactor;

    protected function setUp(): void
    {
        parent::setUp();

        $this->redactor = new PromptRedactor();
    }

    public function test_it_redacts_email_addresses(): void
    {
        [$text, $count] = $this->redactor->redact('Reply to saeid@example.com please.');

        $this->assertSame(1, $count);
        $this->assertStringNotContainsString('saeid@example.com', $text);
        $this->assertStringContainsString('[redacted:email]', $text);
    }

    public function test_it_redacts_iranian_iban_numbers(): void
    {
        [$text, $count] = $this->redactor->redact('Sheba: IR062960000000100324200001');

        $this->assertSame(1, $count);
        $this->assertStringNotContainsString('IR062960000000100324200001', $text);
        $this->assertStringContainsString('[redacted:iban]', $text);
    }

    public function test_it_redacts_card_numbers_with_separators(): void
    {
        [$text, $count] = $this->redactor->redact('Card 6037 9977 1234 5678 was declined.');

        $this->assertSame(1, $count);
        $this->assertStringNotContainsString('5678', $text);
    }

    public function test_it_redacts_mobile_numbers(): void
    {
        [$text, $count] = $this->redactor->redact('Call 09121234567 or +989121234567.');

        $this->assertSame(2, $count);
        $this->assertStringNotContainsString('09121234567', $text);
        $this->assertStringNotContainsString('989121234567', $text);
    }

    public function test_it_redacts_ten_digit_national_ids_written_in_persian_digits(): void
    {
        [$text, $count] = $this->redactor->redact('کد ملی ۰۰۱۳۵۴۶۹۸۷ را بررسی کن');

        $this->assertSame(1, $count);
        $this->assertStringContainsString('[redacted:national_id]', $text);
    }

    public function test_it_leaves_ordinary_prose_untouched(): void
    {
        $prompt = 'Summarise this contract clause about termination in Persian.';

        [$text, $count] = $this->redactor->redact($prompt);

        $this->assertSame(0, $count);
        $this->assertSame($prompt, $text);
    }

    public function test_it_redacts_every_message_in_a_conversation(): void
    {
        $messages = [
            ['role' => 'system', 'content' => 'You are helpful.'],
            ['role' => 'user', 'content' => 'Email a@b.co about order 1234567890'],
        ];

        [$redacted, $count] = $this->redactor->redactMessages($messages);

        $this->assertSame(2, $count);
        $this->assertSame('You are helpful.', $redacted[0]['content']);
        $this->assertStringNotContainsString('a@b.co', $redacted[1]['content']);
        $this->assertStringNotContainsString('1234567890', $redacted[1]['content']);
    }
}
