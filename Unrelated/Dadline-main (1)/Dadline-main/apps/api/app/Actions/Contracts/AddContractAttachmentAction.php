<?php

namespace App\Actions\Contracts;

use App\Models\Contract;
use App\Models\ContractAttachment;
use Illuminate\Validation\ValidationException;

class AddContractAttachmentAction
{
    public function execute(Contract $contract, int $attachmentId, ?int $sortOrder = null): ContractAttachment
    {
        if (! $contract->isDraft()) {
            throw ValidationException::withMessages([
                'contract' => 'Only draft contracts can be edited.',
            ]);
        }

        return ContractAttachment::query()->firstOrCreate(
            [
                'contract_id' => $contract->id,
                'attachment_id' => $attachmentId,
            ],
            [
                'sort_order' => $sortOrder ?? (int) $contract->attachments()->max('sort_order') + 1,
            ]
        )->load('attachment');
    }
}
