<?php

namespace App\Models;

use App\Enums\TicketDepartmentSlug;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TicketDepartment extends Model
{
    protected $fillable = [
        'slug',
        'is_active',
        'is_default',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'slug' => TicketDepartmentSlug::class,
            'is_active' => 'boolean',
            'is_default' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function supporters(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'ticket_department_user')
            ->withPivot('created_at');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class, 'department_id');
    }

    public function label(): string
    {
        return $this->slug->label();
    }
}
