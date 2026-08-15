<?php

namespace App\Actions\Contracts;

use App\Enums\ContractStatus;
use App\Models\Attachment;
use App\Models\Contract;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class DeleteDraftContractAction
{
    public function execute(Contract $contract): void
    {
        if ($contract->status !== ContractStatus::Draft->value) {
            throw ValidationException::withMessages([
                'contract' => 'Only draft contracts can be deleted.',
            ]);
        }

        $contract->loadMissing(['attachments.attachment', 'signatures.signatureFile', 'snapshot', 'aiAnalysis', 'qr']);

        $attachmentIds = collect();
        $storageKeys = collect();

        foreach ($contract->attachments as $contractAttachment) {
            if ($contractAttachment->attachment === null) {
                continue;
            }

            $attachmentIds->push($contractAttachment->attachment->id);
            $storageKeys->push($contractAttachment->attachment->storage_key);
        }

        foreach ($contract->signatures as $signature) {
            $signatureFile = $signature->signatureFile;

            if (
                $signatureFile !== null
                && str_starts_with((string) $signatureFile->storage_key, "contracts/{$contract->id}/signatures/")
            ) {
                $attachmentIds->push($signatureFile->id);
                $storageKeys->push($signatureFile->storage_key);
            }
        }

        if ($contract->qr !== null) {
            $attachmentIds->push($contract->qr->id);
            $storageKeys->push($contract->qr->storage_key);
        }

        $attachmentIds = $attachmentIds->filter()->unique()->values();
        $storageKeys = $storageKeys->filter()->unique()->values();

        DB::transaction(function () use ($contract, $attachmentIds): void {
            $contract->qr_id = null;
            $contract->save();

            $contract->attachments()->delete();
            $contract->signatures()->delete();
            $contract->snapshot()->delete();
            $contract->aiAnalysis()->delete();
            $contract->events()->delete();

            if ($attachmentIds->isNotEmpty()) {
                Attachment::query()
                    ->whereIn('id', $attachmentIds)
                    ->delete();
            }

            $contract->forceDelete();
        });

        if ($storageKeys->isNotEmpty()) {
            Storage::disk('s3')->delete($storageKeys->all());
        }
    }
}
