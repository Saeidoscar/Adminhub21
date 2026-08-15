<?php

namespace App\Support;

final class PersianTextNormalizer
{
    public static function normalizeName(?string $value): string
    {
        if ($value === null) {
            return '';
        }

        $value = strtr($value, [
            'ي' => 'ی',
            'ى' => 'ی',
            'ك' => 'ک',
            'ة' => 'ه',
            'ۀ' => 'هٔ',
            "\u{00A0}" => ' ',
            "\u{200B}" => '',
            "\u{200D}" => '',
            "\u{FEFF}" => '',
            'ـ' => '',
        ]);

        $value = preg_replace('/[\x{064B}-\x{065F}\x{0670}\x{06D6}-\x{06ED}]/u', '', $value) ?? $value;
        $value = preg_replace('/[\p{Z}\s]+/u', ' ', $value) ?? $value;

        return trim($value);
    }
}
