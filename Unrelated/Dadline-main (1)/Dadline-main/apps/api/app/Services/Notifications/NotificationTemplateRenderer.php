<?php

namespace App\Services\Notifications;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Models\NotificationTemplate;
use App\Services\Notifications\Data\RenderedNotification;

class NotificationTemplateRenderer
{
    /**
     * @param  array<string, mixed>  $context
     */
    public function render(string $templateKey, NotificationChannel $channel, array $context): RenderedNotification
    {
        $template = NotificationTemplate::query()
            ->active()
            ->where('key', $templateKey)
            ->where('channel', $channel->value)
            ->first();

        $title = $template?->title;
        $body = $template?->body ?? (string) ($context['message'] ?? '');

        return new RenderedNotification(
            templateKey: $templateKey,
            channel: $channel,
            title: $title === null ? null : $this->replaceVariables($title, $context),
            body: $this->replaceVariables($body, $context),
            payload: $context,
            category: $template?->category ?? NotificationCategory::System,
            priority: $template?->priority ?? NotificationPriority::Normal,
            critical: (bool) ($template?->is_critical ?? false),
            quietHoursEnabled: (bool) ($template?->quiet_hours_enabled ?? true),
            dedupeWindowMinutes: (int) ($template?->dedupe_window_minutes ?? 0),
            retentionDays: $template?->retention_days,
            providerPatterns: $template?->provider_patterns ?? [],
        );
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function replaceVariables(string $template, array $context): string
    {
        $replace = [];

        foreach ($context as $key => $value) {
            if (is_scalar($value) || $value === null) {
                $replace['{{ '.$key.' }}'] = (string) $value;
                $replace['{{'.$key.'}}'] = (string) $value;
                $replace['{'.$key.'}'] = (string) $value;
            }
        }

        return strtr($template, $replace);
    }
}
