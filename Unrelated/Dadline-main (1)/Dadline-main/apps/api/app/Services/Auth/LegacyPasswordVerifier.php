<?php

namespace App\Services\Auth;

use Illuminate\Support\Facades\Hash;
use RuntimeException;

class LegacyPasswordVerifier
{
    private const PHPASS_ITOA64 = './0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    public function check(string $password, ?string $hash): bool
    {
        if (blank($hash)) {
            return false;
        }

        $hash = trim($hash);

        if ($this->isWordPressBcryptHash($hash)) {
            return $this->checkWordPressBcrypt($password, $hash);
        }

        if ($this->isPhpPassHash($hash)) {
            return $this->checkPhpPass($password, $hash);
        }

        if ($this->isLegacyMd5Hash($hash)) {
            return hash_equals($hash, md5($password));
        }

        try {
            return Hash::check($password, $hash);
        } catch (RuntimeException) {
            return password_verify($password, $hash);
        }
    }

    public function needsLaravelRehash(?string $hash): bool
    {
        if (blank($hash)) {
            return false;
        }

        $hash = trim($hash);

        if ($this->isWordPressBcryptHash($hash) || $this->isPhpPassHash($hash) || $this->isLegacyMd5Hash($hash)) {
            return true;
        }

        try {
            return Hash::needsRehash($hash);
        } catch (RuntimeException) {
            return true;
        }
    }

    private function isWordPressBcryptHash(string $hash): bool
    {
        return preg_match('/^\$wp\$2[ayb]\$/', $hash) === 1;
    }

    private function checkWordPressBcrypt(string $password, string $hash): bool
    {
        $bcryptHash = substr($hash, 3);
        $passwordToHash = base64_encode(hash_hmac('sha384', trim($password), 'wp-sha384', true));

        return password_verify($passwordToHash, $bcryptHash);
    }

    private function isPhpPassHash(string $hash): bool
    {
        return strlen($hash) === 34 && preg_match('/^\$[PH]\$/', $hash) === 1;
    }

    private function checkPhpPass(string $password, string $hash): bool
    {
        $countLog2 = strpos(self::PHPASS_ITOA64, $hash[3]);

        if ($countLog2 < 7 || $countLog2 > 30) {
            return false;
        }

        $salt = substr($hash, 4, 8);

        if (strlen($salt) !== 8) {
            return false;
        }

        $count = 1 << $countLog2;
        $computedHash = md5($salt.$password, true);

        do {
            $computedHash = md5($computedHash.$password, true);
        } while (--$count);

        return hash_equals($hash, substr($hash, 0, 12).$this->encode64($computedHash, 16));
    }

    private function encode64(string $input, int $count): string
    {
        $output = '';
        $i = 0;

        do {
            $value = ord($input[$i++]);
            $output .= self::PHPASS_ITOA64[$value & 0x3F];

            if ($i < $count) {
                $value |= ord($input[$i]) << 8;
            }

            $output .= self::PHPASS_ITOA64[($value >> 6) & 0x3F];

            if ($i++ >= $count) {
                break;
            }

            if ($i < $count) {
                $value |= ord($input[$i]) << 16;
            }

            $output .= self::PHPASS_ITOA64[($value >> 12) & 0x3F];

            if ($i++ >= $count) {
                break;
            }

            $output .= self::PHPASS_ITOA64[($value >> 18) & 0x3F];
        } while ($i < $count);

        return $output;
    }

    private function isLegacyMd5Hash(string $hash): bool
    {
        return preg_match('/^[a-f0-9]{32}$/i', $hash) === 1;
    }
}
