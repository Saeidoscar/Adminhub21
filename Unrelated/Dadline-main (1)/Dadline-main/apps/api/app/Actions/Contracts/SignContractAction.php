<?php

namespace App\Actions\Contracts;

use App\Enums\ContractEventType;
use App\Enums\ContractStatus;
use App\Events\ContractSigned;
use App\Models\Attachment;
use App\Models\Signature;
use App\Models\User;
use App\Services\Contracts\ContractEventLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class SignContractAction
{
    public function __construct(
        private ContractEventLogger $events,
        private CompleteContractAction $completeContract
    ) {}

    /**
     * @param  array<string, mixed>|null  $metadata
     */
    public function execute(
        Signature $signature,
        ?int $signatureId = null,
        ?array $metadata = null,
        ?User $actor = null,
        ?Request $request = null
    ): Signature {
        $contract = $signature->contract;

        if ($contract->status !== ContractStatus::Active->value) {
            throw ValidationException::withMessages([
                'contract' => 'Only active contracts can be signed.',
            ]);
        }

        if ($signature->signature_status === 'signed') {
            throw ValidationException::withMessages([
                'signature' => 'This signature has already been completed.',
            ]);
        }

        $snapshotStorageKey = null;

        try {
            $signatureFile = $this->copySignatureFileForContract($signature, $signatureId, $actor);
            $snapshotStorageKey = $signatureFile['storage_key'];

            $signature = DB::transaction(function () use ($signature, $signatureFile, $metadata, $actor, $request, $contract): Signature {
                $snapshotAttachment = Attachment::query()->create([
                    'user_id' => $actor?->id,
                    'storage_key' => $signatureFile['storage_key'],
                    'original_name' => $signatureFile['original_name'],
                    'mime_type' => $signatureFile['mime_type'],
                    'size_bytes' => $signatureFile['size_bytes'],
                    'is_private' => true,
                    'created_at' => now(),
                ]);

                $signature->fill([
                    'signature_status' => 'signed',
                    'signature_id' => $snapshotAttachment->id,
                    'ip_address' => $request?->ip() ?? $signature->ip_address,
                    'user_agent' => $request?->userAgent() ?? $signature->user_agent,
                    'metadata' => array_merge($signature->metadata ?? [], $metadata ?? []),
                    'signed_at' => now(),
                ]);
                $signature->save();

                $this->events->record(
                    contract: $contract,
                    type: ContractEventType::Signed,
                    actor: $actor,
                    data: [
                        'signature_id' => $signature->id,
                        'signature_file_id' => $signature->signature_id,
                        'mobile' => $signature->mobile,
                        'full_name' => $signature->full_name,
                    ],
                    request: $request
                );

                return $signature->refresh();
            });
        } catch (\Throwable $exception) {
            if ($snapshotStorageKey !== null) {
                Storage::disk('s3')->delete($snapshotStorageKey);
            }

            throw $exception;
        }

        ContractSigned::dispatch($contract->id, $signature->id);

        $contract->refresh();
        $unsignedCount = $contract->signatures()
            ->where('signature_status', '!=', 'signed')
            ->count();

        if ($unsignedCount === 0 && $contract->status === ContractStatus::Active->value) {
            $this->completeContract->execute($contract, $actor, $request);
        }

        return $signature;
    }

    /**
     * @return array{storage_key: string, original_name: string, mime_type: string|null, size_bytes: int|null}
     */
    private function copySignatureFileForContract(Signature $signature, ?int $signatureId, ?User $actor): array
    {
        $source = $this->sourceSignatureAttachment($signature, $signatureId, $actor);

        if (blank($source->storage_key)) {
            throw ValidationException::withMessages([
                'signature_id' => 'فایل امضای انتخاب‌شده قابل دسترسی نیست.',
            ]);
        }

        $disk = Storage::disk('s3');

        if (! $disk->exists($source->storage_key)) {
            throw ValidationException::withMessages([
                'signature_id' => 'فایل امضای انتخاب‌شده در فضای ذخیره‌سازی پیدا نشد.',
            ]);
        }

        $extension = strtolower(pathinfo($source->original_name ?: $source->storage_key, PATHINFO_EXTENSION) ?: 'png');
        $storageKey = sprintf(
            'contracts/%d/signatures/%d/%s.%s',
            $signature->contract_id,
            $signature->id,
            (string) Str::uuid(),
            $extension
        );

        if (! $disk->copy($source->storage_key, $storageKey)) {
            throw ValidationException::withMessages([
                'signature_id' => 'ذخیره نسخه دائمی امضای قرارداد انجام نشد.',
            ]);
        }

        $disk->setVisibility($storageKey, 'private');

        return [
            'storage_key' => $storageKey,
            'original_name' => $source->original_name ?: "contract-signature-{$signature->id}.{$extension}",
            'mime_type' => $source->mime_type,
            'size_bytes' => $source->size_bytes,
        ];
    }

    private function sourceSignatureAttachment(Signature $signature, ?int $signatureId, ?User $actor): Attachment
    {
        $sourceId = $signatureId;

        if ($sourceId === null && $actor !== null) {
            $actor->loadMissing('profile');
            $sourceId = $actor->profile?->signature_id;
        }

        if ($sourceId === null) {
            $sourceId = $signature->signature_id;
        }

        if ($sourceId === null) {
            throw ValidationException::withMessages([
                'signature_id' => 'برای ثبت امضای قرارداد، ابتدا تصویر امضا را تایید کنید.',
            ]);
        }

        $source = Attachment::query()->find($sourceId);

        if ($source === null) {
            throw ValidationException::withMessages([
                'signature_id' => 'فایل امضای انتخاب‌شده معتبر نیست.',
            ]);
        }

        if ($actor !== null && ! $actor->isAdmin()) {
            $actor->loadMissing('profile');

            if ((int) $source->user_id !== (int) $actor->id) {
                throw ValidationException::withMessages([
                    'signature_id' => 'فایل امضای انتخاب‌شده متعلق به کاربر امضاکننده نیست.',
                ]);
            }

            if ((int) $source->id !== (int) $actor->profile?->signature_id) {
                throw ValidationException::withMessages([
                    'signature_id' => 'فایل امضای انتخاب‌شده باید همان امضای فعال پروفایل کاربر باشد.',
                ]);
            }
        }

        if (! str_starts_with((string) $source->mime_type, 'image/')) {
            throw ValidationException::withMessages([
                'signature_id' => 'فایل امضا باید از نوع تصویر باشد.',
            ]);
        }

        return $source;
    }
}
