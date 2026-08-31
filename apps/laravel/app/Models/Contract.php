<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Contract extends Model
{
    protected $fillable = [
        'code',
        'employer_id',
        'admin_id',
        'platform',
        'status',
        'amount_toman',
        'amount_usd',
        'has_insurance',
        'has_substitute',
        'term_clause',
        'substitute_clause',
        'start_date',
        'end_date',
        'signed_by_employer_at',
        'signed_by_admin_at',
    ];

    protected $casts = [
        'has_insurance' => 'boolean',
        'has_substitute' => 'boolean',
        'amount_toman' => 'integer',
        'amount_usd' => 'integer',
    ];

    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminProfile::class, 'admin_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'contract_id');
    }
}
