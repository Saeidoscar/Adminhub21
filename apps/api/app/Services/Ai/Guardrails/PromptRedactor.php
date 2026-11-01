<?php

namespace App\Services\Ai\Guardrails;

/**
 * Defence in depth for the LayerCloud training circle.
 *
 * The gateway forwards prompts to whichever upstream provider is cheapest at
 * that moment (see their privacy policy §4), and this repository handles
 * contracts, national identifiers and payment references. Before anything
 * leaves the app we strip the handful of identifiers we can recognise with
 * high confidence. Redaction is deliberately aggressive: a false positive costs
 * a model one number, a false negative would ship a real national ID abroad.
 *
 * Boundaries use Unicode property classes rather than `\b`, because PCRE's `\b`
 * is ASCII-only: a Persian-digit national ID written as ۰۰۱۳۵۴۶۹۸۷ has no word
 * boundary and would slip through a `\b\d{10}\b` rule untouched.
 *
 * This is a backstop, not a licence to send sensitive data to the trial route.
 * The rule remains: no contract text, no identity documents, no payment data.
 */
class PromptRedactor
{
    /**
     * ASCII, Persian (۰-۹) and Arabic-Indic (٠-٩) digits.
     */
    private const DIGIT = '[\d\x{06F0}-\x{06F9}\x{0660}-\x{0669}]';

    /**
     * Not preceded by a letter or a digit of any script.
     */
    private const OPEN = '(?<![\p{L}\p{N}])';

    /**
     * Not followed by another digit, so a 10-digit rule never matches half of a
     * longer number.
     */
    private const CLOSE = '(?![\p{N}])';

    /**
     * Ordered: longer, more specific identifiers first so a card number is not
     * half-eaten by the national-ID rule.
     *
     * @return array<string, string>
     */
    private function patterns(): array
    {
        $d = self::DIGIT;

        return [
            'email' => '/[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}/u',
            'iban' => '/' . self::OPEN . 'IR' . $d . '{24}' . self::CLOSE . '/iu',
            'card' => '/' . self::OPEN . $d . '{4}(?:[ \-]?' . $d . '{4}){3}' . self::CLOSE . '/u',
            'phone' => '/' . self::OPEN . '(?:\+|00)?(?:98|0)?9' . $d . '{9}' . self::CLOSE . '/u',
            // Iranian national ID and postal code are both 10 digits. Caught
            // unconditionally: a stray order number is the cheaper mistake.
            'national_id' => '/' . self::OPEN . $d . '{10}' . self::CLOSE . '/u',
        ];
    }

    /**
     * @return array{0: string, 1: int} the redacted text and how many spans were replaced
     */
    public function redact(string $text): array
    {
        $count = 0;

        foreach ($this->patterns() as $label => $pattern) {
            $text = (string) preg_replace_callback(
                $pattern,
                static function () use (&$count, $label): string {
                    $count++;

                    return '[redacted:' . $label . ']';
                },
                $text,
            );
        }

        return [$text, $count];
    }

    /**
     * @param array<int, array<string, mixed>> $messages
     *
     * @return array{0: array<int, array<string, mixed>>, 1: int}
     */
    public function redactMessages(array $messages): array
    {
        $total = 0;

        foreach ($messages as $index => $message) {
            if (! isset($message['content']) || ! is_string($message['content'])) {
                continue;
            }

            [$redacted, $count] = $this->redact($message['content']);

            $messages[$index]['content'] = $redacted;
            $total += $count;
        }

        return [$messages, $total];
    }
}
