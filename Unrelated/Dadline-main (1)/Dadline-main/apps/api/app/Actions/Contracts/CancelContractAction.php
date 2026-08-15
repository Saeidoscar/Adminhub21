<?php

namespace App\Actions\Contracts;

use App\Enums\ContractStatus;
use App\Models\Attachment;
use App\Models\Contract;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class CancelContractAction
{
    public function execute(Contract $contract, ?User $actor = null, ?Request $request = null): Contract
    {
        if ($contract->status !== ContractStatus::Active->value) {
            throw ValidationException::withMessages([
                'contract' => 'Only active contracts can be cancelled.',
            ]);
        }

        if ($contract->signatures()->where('signature_status', '!=', 'signed')->doesntExist()) {
            throw ValidationException::withMessages([
                'signatures' => 'A fully signed contract cannot be cancelled.',
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

        $cancelled = DB::transaction(function () use ($contract, $attachmentIds): Contract {
            $contract->qr_id = null;
            $contract->status = ContractStatus::Cancelled->value;
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

            return $contract->refresh();
        });

        if ($storageKeys->isNotEmpty()) {
            Storage::disk('s3')->delete($storageKeys->all());
        }

        return $cancelled;
    }
}
