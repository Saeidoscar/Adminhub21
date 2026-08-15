<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DodbotMessage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'conversation_id',
        'in_tokens',
        'out_tokens',
        'prompt',
        'response',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'conversation_id' => 'integer',
            'in_tokens' => 'integer',
            'out_tokens' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function conversation(): BelongsTo
    {
        return $this->belongsTo(DodbotConversation::class, 'conversation_id');
    }
}
