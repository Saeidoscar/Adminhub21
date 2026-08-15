<?php

namespace App\Services\Tickets;

use App\Models\Attachment;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class TicketAttachmentService
{
    public function store(User $user, Ticket $ticket, UploadedFile $file): Attachment
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'bin');
        $storageKey = 'tickets/'.$ticket->uuid.'/'.Str::uuid().'.'.$extension;

        $stored = Storage::disk('s3')->put($storageKey, $file->getContent(), [
            'visibility' => 'private',
            'ContentType' => $file->getMimeType() ?: 'application/octet-stream',
        ]);

        if (! $stored) {
            throw new RuntimeException('ذخیره فایل تیکت در فضای ابری انجام نشد.');
        }

        try {
            return Attachment::query()->create([
                'user_id' => $user->id,
                'storage_key' => $storageKey,
                'original_name' => $file->getClientOriginalName(),
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $file->getSize(),
                'is_private' => true,
            ]);
        } catch (Throwable $exception) {
            Storage::disk('s3')->delete($storageKey);
            throw $exception;
        }
    }
}
