<?php

namespace App\Models;

use App\Enums\QuestionAnswerStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class QuestionAnswer extends Model
{
    public const UPDATED_AT = null;

    protected $table = 'answers_question';

    protected $fillable = [
        'id',
        'question_id',
        'vendor_id',
        'body',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'status' => QuestionAnswerStatus::class,
        ];
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function vendor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'vendor_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'item_id')
            ->where('type', \App\Enums\ReviewType::QuestionAnswer->value);
    }
}
