<?php

namespace App\Services\Notifications;

use App\Services\ExternalServices\OptionServiceSettings;

class SmsProviderSelection
{
    public const SMART = 'smart';

    public const MELIPAYAMAK = 'melipayamak';

    public const ADLY = 'adly';

    public function __construct(
        private readonly OptionServiceSettings $settings,
    ) {}

    /**
     * @return array<int, string>
     */
    public function patternProviderOrder(): array
    {
        return match ($this->mode()) {
            self::MELIPAYAMAK => [self::MELIPAYAMAK],
            self::ADLY => [self::ADLY],
            default => [self::MELIPAYAMAK, self::ADLY],
        };
    }

    public function allows(string $provider): bool
    {
        return in_array($provider, $this->patternProviderOrder(), true);
    }

    public function otpPatternFallbackEnabled(): bool
    {
        return $this->settings->enabled('sms_otp_pattern_fallback_enabled', true);
    }

    public function mode(): string
    {
        $mode = strtolower((string) $this->settings->string('sms_provider_mode', self::SMART));
        $mode = str_replace(['-', ' '], '_', $mode);

        return match ($mode) {
            'meli', 'meli_payamak', self::MELIPAYAMAK => self::MELIPAYAMAK,
            'adl', 'adlsms', self::ADLY => self::ADLY,
            default => self::SMART,
        };
    }
}
