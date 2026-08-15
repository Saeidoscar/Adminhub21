<?php

namespace App\Actions\Contracts;

use App\Enums\ContractEventType;
use App\Enums\ContractEvidenceReportAudience;
use App\Enums\ContractStatus;
use App\Enums\SignatureStatus;
use App\Models\Contract;
use App\Models\User;
use App\Services\Contracts\ContractSnapshotService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class GenerateContractEvidenceReportAction
{
    public function __construct(
        private ContractSnapshotService $snapshots
    ) {}

    /**
     * @return array{content: string, filename: string, mime_type: string, size_bytes: int}
     */
    public function render(
        Contract $contract,
        ContractEvidenceReportAudience $audience = ContractEvidenceReportAudience::User,
        ?User $actor = null
    ): array {
        $report = $this->build($contract, $audience, $actor);
        $filename = "contract-evidence-{$report['safe_tracking']}-{$audience->value}.html";

        return [
            'content' => $report['html'],
            'filename' => $filename,
            'mime_type' => 'text/html; charset=UTF-8',
            'size_bytes' => strlen($report['html']),
        ];
    }

    /**
     * @return array{storage_key: string, content: string, filename: string, mime_type: string, size_bytes: int}
     */
    public function execute(
        Contract $contract,
        ContractEvidenceReportAudience $audience = ContractEvidenceReportAudience::User,
        ?User $actor = null
    ): array {
        $report = $this->build($contract, $audience, $actor);
        $payload = $report['payload'];
        $html = $report['html'];
        $safeTracking = $report['safe_tracking'];

        $filename = "contract-evidence-{$safeTracking}-{$audience->value}.zip";
        $storageKey = "contracts/{$contract->uuid}/evidence-reports/{$audience->value}/{$filename}";
        $content = $this->zip([
            'contract-evidence-report.html' => $html,
            'raw/report-summary.json' => $this->json($payload['summary']),
            'raw/snapshot.json' => $this->json($payload['snapshot']),
            'raw/events.json' => $this->json($payload['events']),
            'raw/signatures.json' => $this->json($payload['signatures']),
            'raw/attachments.json' => $this->json($payload['attachments']),
        ]);

        Storage::disk('s3')->put($storageKey, $content, [
            'visibility' => 'private',
            'ContentType' => 'application/zip',
        ]);

        return [
            'storage_key' => $storageKey,
            'content' => $content,
            'filename' => $filename,
            'mime_type' => 'application/zip',
            'size_bytes' => strlen($content),
        ];
    }

    /**
     * @return array{payload: array<string, mixed>, html: string, safe_tracking: string}
     */
    private function build(
        Contract $contract,
        ContractEvidenceReportAudience $audience,
        ?User $actor
    ): array {
        $contract->loadMissing(['creator', 'attachments.attachment', 'signatures.user', 'snapshot', 'events.actor']);

        if ($contract->status === ContractStatus::Completed->value && $contract->snapshot === null) {
            $this->snapshots->createForContract($contract, $actor);
            $contract->load('snapshot');
        }

        $tracking = $contract->tracking_code ?: (string) $contract->uuid;
        $safeTracking = preg_replace('/[^A-Za-z0-9_-]+/', '-', $tracking) ?: (string) $contract->id;

        $payload = $this->reportPayload($contract, $audience);
        $html = $this->renderHtml($payload, $audience);

        return [
            'payload' => $payload,
            'html' => $html,
            'safe_tracking' => $safeTracking,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function reportPayload(Contract $contract, ContractEvidenceReportAudience $audience): array
    {
        $snapshot = $contract->snapshot;
        $currentBodyHash = hash('sha256', $contract->body);
        $hashMatches = $snapshot !== null && hash_equals($snapshot->body_hash, $currentBodyHash);

        $signatures = $contract->signatures
            ->sortBy('id')
            ->map(fn ($signature): array => [
                'id' => $signature->id,
                'user_id' => $signature->user_id,
                'full_name' => $signature->full_name,
                'mobile' => $signature->mobile,
                'status' => $signature->signature_status,
                'status_label' => SignatureStatus::labelFor($signature->signature_status),
                'signed_at' => $signature->signed_at?->toJSON(),
                'ip_address' => $audience === ContractEvidenceReportAudience::Judicial
                    ? $signature->ip_address
                    : $this->maskIp($signature->ip_address),
                'user_agent' => $audience === ContractEvidenceReportAudience::Judicial
                    ? $signature->user_agent
                    : null,
                'metadata' => $audience === ContractEvidenceReportAudience::Judicial
                    ? $signature->metadata
                    : null,
                'signature_file_id' => $signature->signature_id,
            ])
            ->values()
            ->all();

        $events = $contract->events
            ->sortBy('occurred_at')
            ->map(fn ($event): array => [
                'id' => $event->id,
                'type' => $event->event_type,
                'type_label' => ContractEventType::labelFor($event->event_type),
                'actor_id' => $event->actor_id,
                'actor_name' => $event->actor?->full_name,
                'event_data' => $audience === ContractEvidenceReportAudience::Judicial
                    ? $event->event_data
                    : $this->safeEventData($event->event_data),
                'ip_address' => $audience === ContractEvidenceReportAudience::Judicial
                    ? $event->ip_address
                    : $this->maskIp($event->ip_address),
                'user_agent' => $audience === ContractEvidenceReportAudience::Judicial
                    ? $event->user_agent
                    : null,
                'occurred_at' => $event->occurred_at?->toJSON(),
            ])
            ->values()
            ->all();
        $attachments = $contract->attachments
            ->sortBy('sort_order')
            ->map(fn ($attachment): array => [
                'id' => $attachment->id,
                'attachment_id' => $attachment->attachment_id,
                'sort_order' => $attachment->sort_order,
                'original_name' => $attachment->attachment?->original_name,
                'mime_type' => $attachment->attachment?->mime_type,
                'size_bytes' => $attachment->attachment?->size_bytes,
            ])
            ->values()
            ->all();

        return [
            'summary' => [
                'generated_at' => now()->toJSON(),
                'audience' => $audience->value,
                'audience_label' => $audience->label(),
                'contract_id' => $contract->id,
                'uuid' => $contract->uuid,
                'tracking_code' => $contract->tracking_code,
                'title' => $contract->title,
                'status' => $contract->status,
                'status_label' => ContractStatus::labelFor($contract->status),
                'creator_id' => $contract->creator_id,
                'creator_name' => $contract->creator?->full_name,
                'created_at' => $contract->created_at?->toJSON(),
                'updated_at' => $contract->updated_at?->toJSON(),
                'hash_algorithm' => $snapshot?->hash_algorithm ?? 'sha256',
                'body_hash' => $snapshot?->body_hash,
                'current_body_hash' => $currentBodyHash,
                'payload_hash' => $snapshot?->payload_hash,
                'hash_matches_current_body' => $hashMatches,
                'verification_url' => $contract->tracking_code === null
                    ? null
                    : url("/contract/verify?code={$contract->tracking_code}"),
            ],
            'contract_body' => $contract->body,
            'snapshot' => $snapshot?->toArray(),
            'attachments' => $attachments,
            'signatures' => $signatures,
            'events' => $events,
        ];
    }

    /**
     * @param  array<string, mixed>|null  $data
     * @return array<string, mixed>|null
     */
    private function safeEventData(?array $data): ?array
    {
        if ($data === null) {
            return null;
        }

        return collect($data)
            ->except(['user_agent', 'metadata', 'headers', 'raw_payload', 'gateway_payload', 'verification_code'])
            ->all();
    }

    private function maskIp(?string $ip): ?string
    {
        if ($ip === null || $ip === '') {
            return null;
        }

        if (str_contains($ip, ':')) {
            return Str::beforeLast($ip, ':').':****';
        }

        $parts = explode('.', $ip);

        if (count($parts) !== 4) {
            return '***';
        }

        return "{$parts[0]}.{$parts[1]}.xxx.xxx";
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function renderHtml(array $payload, ContractEvidenceReportAudience $audience): string
    {
        $summary = $payload['summary'];
        $rows = [
            'نوع گزارش' => $summary['audience_label'],
            'کد رهگیری' => $summary['tracking_code'] ?? '-',
            'UUID' => $summary['uuid'],
            'عنوان' => $summary['title'],
            'وضعیت' => $summary['status_label'].' ('.$summary['status'].')',
            'سازنده' => ($summary['creator_name'] ?: '-').' / '.$summary['creator_id'],
            'الگوریتم هش' => $summary['hash_algorithm'],
            'هش متن ثبت‌شده' => $summary['body_hash'] ?? '-',
            'هش متن فعلی' => $summary['current_body_hash'],
            'نتیجه تطبیق' => $summary['hash_matches_current_body'] ? 'مطابق است' : 'مطابق نیست',
            'هش payload' => $summary['payload_hash'] ?? '-',
            'زمان تولید گزارش' => $summary['generated_at'],
        ];

        $htmlRows = collect($rows)
            ->map(fn ($value, $key): string => '<tr><th>'.e($key).'</th><td>'.e((string) $value).'</td></tr>')
            ->implode('');
        $signatureRows = collect($payload['signatures'])
            ->map(fn (array $signature): string => '<tr><td>'.e((string) $signature['id']).'</td><td>'.e((string) $signature['full_name']).'</td><td>'.e((string) $signature['mobile']).'</td><td>'.e((string) $signature['status_label']).' <small>('.e((string) $signature['status']).')</small></td><td>'.e((string) $signature['signed_at']).'</td><td>'.e((string) $signature['ip_address']).'</td></tr>')
            ->implode('');
        $attachmentRows = collect($payload['attachments'])
            ->map(fn (array $attachment): string => '<tr><td>'.e((string) $attachment['attachment_id']).'</td><td>'.e((string) $attachment['original_name']).'</td><td>'.e((string) $attachment['mime_type']).'</td><td>'.e((string) $attachment['size_bytes']).'</td></tr>')
            ->implode('');
        $eventRows = collect($payload['events'])
            ->map(fn (array $event): string => '<tr><td>'.e((string) $event['occurred_at']).'</td><td>'.e((string) $event['type_label']).' <small>('.e((string) $event['type']).')</small></td><td>'.e((string) $event['actor_id']).'</td><td><code>'.e($this->json($event['event_data'])).'</code></td></tr>')
            ->implode('');

        return '<!doctype html><html lang="fa" dir="rtl"><head><meta charset="utf-8"><title>گواهی اصالت قرارداد</title><style>body{font-family:Tahoma,Arial,sans-serif;line-height:1.8;color:#111;margin:32px}h1,h2{margin:0 0 16px}table{width:100%;border-collapse:collapse;margin:16px 0}th,td{border:1px solid #ccc;padding:8px;vertical-align:top}th{width:220px;background:#f5f5f5;text-align:right}code{white-space:pre-wrap;direction:ltr;display:block;font-family:Consolas,monospace}.ok{color:#067a46;font-weight:bold}.bad{color:#b42318;font-weight:bold}.body{border:1px solid #ddd;padding:16px;margin-top:12px}</style></head><body>'
            .'<h3>گواهی اصالت قرارداد دادلاین</h3>'
            .'<p>این گزارش برای مخاطب «'.e($audience->label()).'» تولید شده است.</p>'
            .'<table>'.$htmlRows.'</table>'
            .'<h2>پیوست‌های قرارداد</h2><table><tr><th>شناسه فایل</th><th>نام فایل</th><th>نوع فایل</th><th>حجم</th></tr>'.$attachmentRows.'</table>'
            .'<h2>طرفین و امضاها</h2><table><tr><th>شناسه</th><th>نام</th><th>موبایل</th><th>وضعیت</th><th>زمان امضا</th><th>IP</th></tr>'.$signatureRows.'</table>'
            .'<h2>رویدادها</h2><table><tr><th>زمان</th><th>نوع</th><th>کاربر/عامل</th><th>داده</th></tr>'.$eventRows.'</table>'
            .'<h2>متن قرارداد</h2><div class="body">'.$this->safeContractHtml((string) $payload['contract_body']).'</div>'
            .'<div class="footer text-center">dadline.net</div>'
            .'</body></html>';
    }

    private function safeContractHtml(string $html): string
    {
        return strip_tags(
            $html,
            '<p><br><strong><b><em><i><u><ul><ol><li><h1><h2><h3><h4><h5><h6><table><thead><tbody><tr><th><td><div><span>'
        );
    }

    private function json(mixed $value): string
    {
        return json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    }

    /**
     * Create a small ZIP archive in memory without touching Laravel local storage.
     *
     * @param  array<string, string>  $files
     */
    private function zip(array $files): string
    {
        $data = '';
        $centralDirectory = '';
        $offset = 0;

        foreach ($files as $filename => $contents) {
            $name = str_replace('\\', '/', $filename);
            $nameLength = strlen($name);
            $size = strlen($contents);
            $crc = (int) sprintf('%u', crc32($contents));

            $localHeader = pack(
                'VvvvvvVVVvv',
                0x04034b50,
                20,
                0,
                0,
                0,
                0,
                $crc,
                $size,
                $size,
                $nameLength,
                0
            ).$name;

            $centralDirectory .= pack(
                'VvvvvvvVVVvvvvvVV',
                0x02014b50,
                20,
                20,
                0,
                0,
                0,
                0,
                $crc,
                $size,
                $size,
                $nameLength,
                0,
                0,
                0,
                0,
                0,
                $offset
            ).$name;

            $data .= $localHeader.$contents;
            $offset += strlen($localHeader) + $size;
        }

        return $data
            .$centralDirectory
            .pack(
                'VvvvvVVv',
                0x06054b50,
                0,
                0,
                count($files),
                count($files),
                strlen($centralDirectory),
                $offset,
                0
            );
    }
}
