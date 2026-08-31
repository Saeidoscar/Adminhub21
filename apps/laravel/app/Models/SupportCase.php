<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SupportCase extends Model
{
    protected $table = 'cases';

    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'admin_id',
        'employer_id',
        'title',
        'description',
        'priority',
        'status',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(AdminProfile::class, 'admin_id');
    }

    public function employer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'employer_id');
    }

    public function tasks(): HasMany
    {
        return $this->hasMany(Task::class, 'case_id');
    }

    public function timeLogs(): HasMany
    {
        return $this->hasMany(TimeLog::class, 'case_id');
    }
}
