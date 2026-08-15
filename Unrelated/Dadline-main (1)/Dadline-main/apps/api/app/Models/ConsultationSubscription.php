<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ConsultationSubscription extends Model
{
    protected $fillable = [
        'client_id',
        'vendor_id',
        'purchased',
        'used',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'purchased' => 'integer',
            'used' => 'integer',
            'is_read' => 'boolean',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function officeCases(): HasMany
    {
        return $this->hasMany(OfficeCase::class, 'subscription_id');
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class, 'subject_id')
            ->where('subject_type', 'subscription');
    }

    public function remaining(): int
    {
        return max($this->purchased - $this->used, 0);
    }
}
