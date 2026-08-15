<?php

namespace App\Services\Contracts;

use App\Models\Attachment;
use App\Models\Contract;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ContractQrCodeService
{
    public function ensureForContract(Contract $contract): ?Attachment
    {
        if (blank($contract->tracking_code)) {
            return null;
        }

        if ($contract->qr_id !== null) {
            return $contract->qr;
        }

        return $this->createForContract($contract);
    }

    public function verificationUrl(Contract $contract): ?string
    {
        if (blank($contract->tracking_code)) {
            return null;
        }

        return rtrim(config('app.contract_public_url', 'https://dadline.net'), '/')
            .'/contracts/'.$contract->tracking_code;
    }

    private function createForContract(Contract $contract): Attachment
    {
        $verificationUrl = $this->verificationUrl($contract);
        $renderer = new ImageRenderer(
            new RendererStyle(360),
            new SvgImageBackEnd
        );
        $svg = (new Writer($renderer))->writeString($verificationUrl);
        $storageKey = sprintf(
            'contracts/%s/qrcodes/%s.svg',
            $contract->uuid,
            (string) Str::uuid()
        );

        Storage::disk('s3')->put($storageKey, $svg, [
            'visibility' => 'public',
            'ContentType' => 'image/svg+xml',
        ]);

        try {
            return DB::transaction(function () use ($contract, $storageKey, $svg): Attachment {
                $attachment = Attachment::query()->create([
                    'user_id' => $contract->creator_id,
                    'storage_key' => $storageKey,
                    'original_name' => "contract-{$contract->tracking_code}-qr.svg",
                    'mime_type' => 'image/svg+xml',
                    'size_bytes' => strlen($svg),
                    'is_private' => false,
                    'created_at' => now(),
                ]);

                $contract->forceFill(['qr_id' => $attachment->id])->save();

                return $attachment;
            });
        } catch (\Throwable $exception) {
            Storage::disk('s3')->delete($storageKey);

            throw $exception;
        }
    }
}
