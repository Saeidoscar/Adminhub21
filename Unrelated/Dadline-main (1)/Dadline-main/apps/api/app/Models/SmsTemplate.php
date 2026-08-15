<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SmsTemplate extends Model
{
    protected $fillable = [
        'key',
        'title',
        'content',
        'variables',
        'patterns',
        'active',
    ];


    protected $casts = [
        'variables' => 'array',
        'patterns' => 'array',
        'active' => 'boolean',
    ];
}