<?php

namespace Tests\Unit;

use App\Services\Auth\LegacyPasswordVerifier;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class LegacyPasswordVerifierTest extends TestCase
{
    public function test_it_accepts_wordpress_bcrypt_hashes(): void
    {
        $verifier = new LegacyPasswordVerifier;
        $hash = $this->makeWordPressBcryptHash('legacy-secret');

        $this->assertTrue($verifier->check('legacy-secret', $hash));
        $this->assertFalse($verifier->check('wrong-password', $hash));
        $this->assertTrue($verifier->needsLaravelRehash($hash));
    }

    public function test_it_accepts_legacy_wordpress_phpass_hashes(): void
    {
        $verifier = new LegacyPasswordVerifier;
        $hash = '$P$B55D6LjfHDkINU5wF.v2BuuzO0/XPk/';

        $this->assertTrue($verifier->check('test', $hash));
        $this->assertFalse($verifier->check('wrong-password', $hash));
        $this->assertTrue($verifier->needsLaravelRehash($hash));
    }

    public function test_it_keeps_laravel_hashes_on_the_normal_path(): void
    {
        $verifier = new LegacyPasswordVerifier;
        $hash = Hash::make('current-secret');

        $this->assertTrue($verifier->check('current-secret', $hash));
        $this->assertFalse($verifier->needsLaravelRehash($hash));
    }

    private function makeWordPressBcryptHash(string $password): string
    {
        $passwordToHash = base64_encode(hash_hmac('sha384', trim($password), 'wp-sha384', true));

        return '$wp'.password_hash($passwordToHash, PASSWORD_BCRYPT);
    }
}
