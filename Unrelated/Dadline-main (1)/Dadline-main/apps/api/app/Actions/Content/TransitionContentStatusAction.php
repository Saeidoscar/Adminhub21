<?php

namespace App\Actions\Content;

use App\Enums\ContentStatus;
use App\Models\Blog;
use App\Models\Story;
use Carbon\CarbonImmutable;
use Illuminate\Validation\ValidationException;

class TransitionContentStatusAction
{
    public function execute(Story|Blog $content, ContentStatus $status, array $data = []): Story|Blog
    {
        if (! $content->status->canTransitionTo($status)) {
            throw ValidationException::withMessages([
                'status' => 'This content status transition is not allowed.',
            ]);
        }

        if ($status === ContentStatus::Rejected && blank($data['rejection_reason'] ?? null)) {
            throw ValidationException::withMessages([
                'rejection_reason' => 'A rejection reason is required.',
            ]);
        }

        $content->status = $status;
        $content->rejection_reason = $status === ContentStatus::Rejected
            ? $data['rejection_reason']
            : null;

        if ($status === ContentStatus::Published) {
            $content->published_at = filled($data['published_at'] ?? null)
                ? CarbonImmutable::parse($data['published_at'])
                : now();
        } elseif ($status === ContentStatus::Draft) {
            $content->published_at = null;
        }

        $content->save();

        return $content->refresh();
    }
}
