<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class UserProfile extends Model
{
    protected $table = 'user_profiles';

    protected $primaryKey = 'user_id';

    public $incrementing = false;

    protected $keyType = 'int';

    protected $fillable = [
        'user_id',
        'national_id',
        'birth_date',
        'iban',
        'city_id',
        'referrer_id',
        'avatar_id',
        'signature_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function city(): BelongsTo
    {
        return $this->belongsTo(City::class);
    }

    public function referrer(): BelongsTo
    {
        return $this->belongsTo(
            User::class,
            'referrer_id'
        );
    }

    public function referrals()
    {
        return $this->hasMany(
            UserProfile::class,
            'referrer_id'
        );
    }

    public function avatar(): BelongsTo
    {
        return $this->belongsTo(
            Attachment::class,
            'avatar_id'
        );
    }

    public function signature(): BelongsTo
    {
        return $this->belongsTo(
            Attachment::class,
            'signature_id'
        );
    }

    public function attachments(): MorphMany
    {
        return $this->morphMany(
            Attachment::class,
            'attachable'
        );
    }
}
