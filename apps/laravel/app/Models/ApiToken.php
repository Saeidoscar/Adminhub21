<?php

namespace App\Models;

use Laravel\Sanctum\PersonalAccessToken;

class ApiToken extends PersonalAccessToken
{
    protected $table = 'api_tokens';

    public function tokenable()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
