<?php

namespace App\Models;

use App\Enums\ServiceRequestStatus;
use App\Enums\ServiceRequestType;
use App\Enums\ServiceRequestVendorType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class ServiceRequest extends Model
{
    use SoftDeletes;

    protected $attributes = [
        'type' => ServiceRequestType::Case->value,
        'vendor_type' => ServiceRequestVendorType::All->value,
        'status' => ServiceRequestStatus::Draft->value,
    ];

    protected $fillable = [
        'uuid',
        'requester_id',
        'category_id',
        'offer_id',
        'type',
        'vendor_type',
        'title',
        'description',
        'details',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'requester_id' => 'integer',
            'category_id' => 'integer',
            'offer_id' => 'integer',
            'type' => ServiceRequestType::class,
            'vendor_type' => ServiceRequestVendorType::class,
            'details' => 'array',
            'status' => ServiceRequestStatus::class,
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
            'deleted_at' => 'datetime',
        ];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(LegalCategory::class, 'category_id');
    }

    public function offer(): BelongsTo
    {
        return $this->belongsTo(ServiceOffer::class, 'offer_id');
    }

    public function offers(): HasMany
    {
        return $this->hasMany(ServiceOffer::class, 'request_id');
    }

    public function result(): HasOne
    {
        return $this->hasOne(ServiceResult::class, 'request_id');
    }

    public function attachmentRecords(): HasMany
    {
        return $this->hasMany(ServiceAttachment::class, 'request_id');
    }

    public function attachments(): BelongsToMany
    {
        return $this->belongsToMany(Attachment::class, 'service_attachments', 'request_id', 'attachment_id')
            ->withPivot('sort_order')
            ->orderByPivot('sort_order');
    }

    public function conversation(): HasOne
    {
        return $this->hasOne(Conversation::class, 'subject_id')
            ->where('subject_type', 'service');
    }
}
