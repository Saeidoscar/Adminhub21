<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OfficeAttachment extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'office_id',
        'case_id',
        'attachment_id',
        'uploaded_by',
        'title',
        'type',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'office_id' => 'integer',
            'case_id' => 'integer',
            'attachment_id' => 'integer',
            'uploaded_by' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function office(): BelongsTo
    {
        return $this->belongsTo(Office::class);
    }

    public function officeCase(): BelongsTo
    {
        return $this->belongsTo(OfficeCase::class, 'case_id');
    }

    public function attachment(): BelongsTo
    {
        return $this->belongsTo(Attachment::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
