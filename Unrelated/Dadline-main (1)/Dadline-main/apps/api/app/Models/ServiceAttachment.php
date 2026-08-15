<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ServiceAttachment extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = [
        'request_id',
        'attachment_id',
        'sort_order',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'request_id' => 'integer',
            'attachment_id' => 'integer',
            'sort_order' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function request(): BelongsTo
    {
        return $this->belongsTo(ServiceRequest::class, 'request_id');
    }

    public function attachment(): BelongsTo
    {
        return $this->belongsTo(Attachment::class);
    }
}
