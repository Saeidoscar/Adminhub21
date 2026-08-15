<?php

namespace App\Http\Controllers\Api\Contracts;

use App\Actions\Contracts\AddContractAttachmentAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Contracts\StoreContractAttachmentRequest;
use App\Http\Requests\Contracts\UploadContractAttachmentRequest;
use App\Http\Resources\Contracts\ContractAttachmentResource;
use App\Models\Attachment;
use App\Models\Contract;
use App\Models\ContractAttachment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContractAttachmentController extends Controller
{
    public function index(Contract $contract): AnonymousResourceCollection
    {
        $this->authorize('view', $contract);

        return ContractAttachmentResource::collection(
            $contract->attachments()->with('attachment')->orderBy('sort_order')->get()
        );
    }

    public function store(
        StoreContractAttachmentRequest $request,
        Contract $contract,
        AddContractAttachmentAction $action
    ): JsonResponse {
        $this->authorize('manageDraft', $contract);
        $validated = $request->validated();
        $attachment = Attachment::query()->findOrFail($validated['attachment_id']);
        abort_unless($request->user()->isAdmin() || (int) $attachment->user_id === (int) $request->user()->id, 403);

        $attachment = $action->execute(
            $contract,
            (int) $validated['attachment_id'],
            array_key_exists('sort_order', $validated) ? (int) $validated['sort_order'] : null
        );

        return (new ContractAttachmentResource($attachment))->response()->setStatusCode(201);
    }

    public function upload(
        UploadContractAttachmentRequest $request,
        Contract $contract,
        AddContractAttachmentAction $action
    ): JsonResponse {
        $this->authorize('manageDraft', $contract);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $storageKey = sprintf(
            'contracts/%s/attachments/%s.%s',
            $contract->uuid,
            (string) Str::uuid(),
            $extension
        );

        Storage::disk('s3')->put($storageKey, $file->getContent(), [
            'visibility' => 'private',
        ]);

        $attachment = Attachment::query()->create([
            'user_id' => $request->user()->id,
            'storage_key' => $storageKey,
            'original_name' => $file->getClientOriginalName(),
            'mime_type' => $file->getClientMimeType(),
            'size_bytes' => $file->getSize(),
            'is_private' => true,
            'created_at' => now(),
        ]);

        $contractAttachment = $action->execute(
            $contract,
            $attachment->id,
            $request->has('sort_order') ? (int) $request->validated('sort_order') : null
        );

        return (new ContractAttachmentResource($contractAttachment))->response()->setStatusCode(201);
    }

    public function destroy(Contract $contract, ContractAttachment $contractAttachment): JsonResponse
    {
        $this->authorize('manageDraft', $contract);
        abort_unless((int) $contractAttachment->contract_id === (int) $contract->id, 404);

        $contractAttachment->delete();

        return response()->json(status: 204);
    }
}
