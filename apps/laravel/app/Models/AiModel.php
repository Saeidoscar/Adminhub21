<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AiModel extends Model
{
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'provider',
        'code',
        'name',
        'description',
        'input_cost',
        'output_cost',
        'context_window',
        'api_base_url',
        'default_temperature',
        'max_output_tokens',
        'supports_streaming',
        'supports_vision',
        'is_active',
    ];

    protected $casts = [
        'input_cost' => 'float',
        'output_cost' => 'float',
        'context_window' => 'integer',
        'default_temperature' => 'float',
        'max_output_tokens' => 'integer',
        'supports_streaming' => 'boolean',
        'supports_vision' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function conversations(): HasMany
    {
        return $this->hasMany(AiConversation::class, 'model_id');
    }
}
