<?php

namespace App\Models;

use App\Enums\DodbotConversationStatus;
use App\Enums\DodbotConversationType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class DodbotConversation extends Model
{
    protected $attributes = [
        'model_id' => 1,
        'status' => DodbotConversationStatus::Active->value,
        'type' => DodbotConversationType::LegalQuestion->value,
    ];

    protected $fillable = [
        'uuid',
        'user_id',
        'title',
        'type',
        'model_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'type' => DodbotConversationType::class,
            'model_id' => 'integer',
            'status' => DodbotConversationStatus::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(DodbotMessage::class, 'conversation_id');
    }

    public function model(): BelongsTo
    {
        return $this->belongsTo(DadbotModel::class, 'model_id');
    }
}
