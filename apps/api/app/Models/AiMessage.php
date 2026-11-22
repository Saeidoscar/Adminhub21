<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AiMessage extends Model
{
    protected $fillable = [
        'conversation_id',
        'prompt',
        'response',
        'in_tokens',
        'out_tokens',
        'cost_toman',
        'raw_cost_usd',
        'billing_source',
        'provider',
        'model_code',
    ];

    protected function casts(): array
    {
        return [
            'conversation_id' => 'integer',
            'in_tokens' => 'integer',
            'out_tokens' => 'integer',
            'cost_toman' => 'integer',
            'raw_cost_usd' => 'decimal:8',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /*
    |--------------------------------------------------------------------------
    | Relations
    |--------------------------------------------------------------------------
    */

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(AiConversation::class, 'conversation_id');
    }

    /*
    |--------------------------------------------------------------------------
    | Helpers
    |--------------------------------------------------------------------------
    */

    public function hasResponse(): bool
    {
        return ! empty($this->response);
    }
}
