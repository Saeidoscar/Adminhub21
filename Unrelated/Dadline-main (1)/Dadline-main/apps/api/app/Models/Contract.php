<?php

namespace App\Models;

use App\Enums\ContractStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Contract extends Model
{
    use SoftDeletes;

    protected $attributes = [
        'status' => 'draft',
    ];

    protected $fillable = [
        'uuid',
        'creator_id',
        'title',
        'body',
        'status',
        'tracking_code',
        'pin_code',
        'qr_id',
    ];

    protected function casts(): array
    {
        return [
            'creator_id' => 'integer',
            'qr_id' => 'integer',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function qr(): BelongsTo
    {
        return $this->belongsTo(Attachment::class, 'qr_id');
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(ContractAttachment::class);
    }

    public function signatures(): HasMany
    {
        return $this->hasMany(Signature::class);
    }

    public function snapshot(): HasOne
    {
        return $this->hasOne(ContractSnapshot::class);
    }

    public function aiAnalysis(): HasOne
    {
        return $this->hasOne(ContractAiAnalysis::class);
    }

    public function events(): HasMany
    {
        return $this->hasMany(ContractEvent::class);
    }

    public function isDraft(): bool
    {
        return $this->status === 'draft';
    }

    public function statusLabel(): string
    {
        return ContractStatus::labelFor($this->status);
    }
}
