<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiMessage extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'conversation_id',
        'role',
        'content',
        'provider',
        'model_code',
        'prompt_tokens',
        'completion_tokens',
        'total_tokens',
        'input_cost',
        'output_cost',
        'total_cost',
        'response_time_ms',
    ];

    protected $casts = [
        'prompt_tokens' => 'integer',
        'completion_tokens' => 'integer',
        'total_tokens' => 'integer',
        'input_cost' => 'float',
        'output_cost' => 'float',
        'total_cost' => 'float',
        'response_time_ms' => 'integer',
    ];

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AiConversation::class, 'conversation_id');
    }
}
