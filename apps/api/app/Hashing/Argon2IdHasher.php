<?php

namespace App\Hashing;

use Illuminate\Hashing\Argon2IdHasher as LaravelArgon2IdHasher;
use Illuminate\Hashing\BcryptHasher;

class Argon2IdHasher extends LaravelArgon2IdHasher
{
    private BcryptHasher $bcrypt;

    public function __construct(array $options = [], ?BcryptHasher $bcrypt = null)
    {
        parent::__construct($options);

        $this->bcrypt = $bcrypt ?? new BcryptHasher;
    }

    public function check(#[\SensitiveParameter] $value, $hashedValue, array $options = []): bool
    {
        if ($this->isBcryptHash($hashedValue)) {
            return $this->bcrypt->check($value, $hashedValue, $options);
        }

        return parent::check($value, $hashedValue, $options);
    }

    public function needsRehash($hashedValue, array $options = []): bool
    {
        if ($this->isBcryptHash($hashedValue)) {
            return $this->bcrypt->needsRehash($hashedValue, $options);
        }

        return parent::needsRehash($hashedValue, $options);
    }

    public function verifyConfiguration($value): bool
    {
        if ($this->isBcryptHash($value)) {
            return $this->bcrypt->verifyConfiguration($value);
        }

        return parent::verifyConfiguration($value);
    }

    private function isBcryptHash(mixed $hashedValue): bool
    {
        return is_string($hashedValue) && password_get_info($hashedValue)['algoName'] === 'bcrypt';
    }
}
