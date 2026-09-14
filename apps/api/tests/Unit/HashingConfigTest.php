<?php

namespace Tests\Unit;

use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class HashingConfigTest extends TestCase
{
    public function test_argon2id_is_the_default_hash_driver(): void
    {
        $this->assertSame('argon2id', config('hashing.driver'));
        $this->assertSame('api', Config::get('auth.defaults.guard'));
    }

    public function test_legacy_bcrypt_hashes_remain_verifiable(): void
    {
        $hash = password_hash('password', PASSWORD_BCRYPT, ['cost' => 4]);

        $this->assertTrue(Hash::check('password', $hash));
    }
}
