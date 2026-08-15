<?php

namespace App\Http\Controllers\Api\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\UploadUserSignatureRequest;
use App\Models\Attachment;
use App\Models\Signature;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UserSignatureController extends Controller
{
    public function store(UploadUserSignatureRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);
        $previousAttachment = $profile->signature_id
            ? Attachment::query()
                ->whereKey($profile->signature_id)
                ->where('user_id', $user->id)
                ->first()
            : null;

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        $storageKey = sprintf(
            'users/%d/signatures/%s.%s',
            $user->id,
            (string) Str::uuid(),
            $extension
        );

        Storage::disk('s3')->put($storageKey, $file->getContent(), [
            'visibility' => 'private',
        ]);

        try {
            $attachment = DB::transaction(function () use ($file, $profile, $storageKey, $user): Attachment {
                $attachment = Attachment::query()->create([
                    'user_id' => $user->id,
                    'storage_key' => $storageKey,
                    'original_name' => $file->getClientOriginalName(),
                    'mime_type' => $file->getClientMimeType(),
                    'size_bytes' => $file->getSize(),
                    'is_private' => true,
                    'created_at' => now(),
                ]);

                $profile->forceFill(['signature_id' => $attachment->id])->save();

                return $attachment;
            });
        } catch (\Throwable $exception) {
            Storage::disk('s3')->delete($storageKey);

            throw $exception;
        }

        $previousDeleted = $this->deletePreviousAttachmentIfUnused($previousAttachment);

        return response()->json([
            'data' => [
                'signatureId' => $attachment->id,
                'signatureUrl' => $attachment->getUrl(false),
                'originalName' => $attachment->original_name,
                'mimeType' => $attachment->mime_type,
                'sizeBytes' => $attachment->size_bytes,
                'previousSignatureDeleted' => $previousDeleted,
            ],
        ], 201);
    }

    private function deletePreviousAttachmentIfUnused(?Attachment $attachment): bool
    {
        if (! $attachment) {
            return false;
        }

        $isUsedByContractSignature = Signature::query()
            ->where('signature_id', $attachment->id)
            ->exists();

        if ($isUsedByContractSignature) {
            return false;
        }

        Storage::disk('s3')->delete($attachment->storage_key);
        $attachment->delete();

        return true;
    }
}
