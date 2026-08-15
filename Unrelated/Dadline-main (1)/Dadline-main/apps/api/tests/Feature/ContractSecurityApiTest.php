<?php

namespace Tests\Feature;

use App\Actions\Contracts\SignContractAction;
use App\Actions\Contracts\VerifySignatureOtpAction;
use App\Enums\ContractEventType;
use App\Enums\ContractStatus;
use App\Http\Middleware\UpdateLastSeen;
use App\Models\Attachment;
use App\Models\Contract;
use App\Models\ContractAttachment;
use App\Models\ContractEvent;
use App\Models\ContractSnapshot;
use App\Models\Signature;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

class ContractSecurityApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(UpdateLastSeen::class);
    }

    public function test_contract_activation_payment_requires_level_two_verification(): void
    {
        $creator = $this->user('09120000001');
        $contract = $this->contract($creator, ContractStatus::Draft);

        $this->actingAs($creator, 'sanctum')
            ->postJson("/v1/contracts/{$contract->uuid}/payment", [
                'return_url' => 'https://dadline.test/contracts/'.$contract->uuid,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('verification');
    }

    public function test_invited_viewer_must_be_level_two_verified_before_opening_active_contract(): void
    {
        $creator = $this->user('09120000002');
        $viewer = $this->user('09120000003');
        $contract = $this->contract($creator, ContractStatus::Active);
        Signature::query()->create([
            'contract_id' => $contract->id,
            'mobile' => $viewer->mobile,
            'full_name' => 'نام دعوتی',
        ]);

        $this->actingAs($viewer, 'sanctum')
            ->getJson("/v1/contracts/{$contract->uuid}")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('verification');
    }

    public function test_verified_invited_viewer_access_updates_signature_name_and_records_view_event(): void
    {
        $creator = $this->user('09120000004');
        $viewer = $this->user('09120000005', 'فرهاد', 'عبدی');
        $this->verifyLevelTwo($viewer);
        $contract = $this->contract($creator, ContractStatus::Active);
        $signature = Signature::query()->create([
            'contract_id' => $contract->id,
            'mobile' => $viewer->mobile,
            'full_name' => 'نام قدیمی',
        ]);

        $this->actingAs($viewer, 'sanctum')
            ->getJson("/v1/contracts/{$contract->uuid}")
            ->assertOk();

        $signature->refresh();
        $this->assertSame($viewer->id, $signature->user_id);
        $this->assertSame('فرهاد عبدی', $signature->full_name);

        $event = ContractEvent::query()
            ->where('contract_id', $contract->id)
            ->where('actor_id', $viewer->id)
            ->where('event_type', ContractEventType::Viewed->value)
            ->sole();

        $this->assertSame($signature->id, $event->event_data['signature_id']);
        $this->assertSame('کاربر دعوت‌شده وارد قرارداد شد.', $event->event_data['message']);
    }

    public function test_signing_copies_current_profile_signature_to_private_contract_attachment(): void
    {
        Storage::fake('s3');

        $user = $this->user('09120000006');
        $this->verifyLevelTwo($user);
        $sourceAttachment = $this->profileSignature($user, 'users/1/signatures/profile.png');
        $contract = $this->contract($user, ContractStatus::Active);
        $signature = Signature::query()->create([
            'contract_id' => $contract->id,
            'user_id' => $user->id,
            'mobile' => $user->mobile,
            'full_name' => $user->full_name,
            'verification_code' => '123456',
            'code_expires_at' => now()->addMinutes(10),
        ]);
        Signature::query()->create([
            'contract_id' => $contract->id,
            'mobile' => '09120000007',
            'full_name' => 'طرف دوم',
        ]);

        $signature = app(VerifySignatureOtpAction::class)->execute(
            signature: $signature,
            code: '123456',
            actor: $user
        );

        app(SignContractAction::class)->execute(
            signature: $signature,
            signatureId: $sourceAttachment->id,
            metadata: ['method' => 'profile_signature'],
            actor: $user
        );

        $signature->refresh();
        $snapshot = Attachment::query()->findOrFail($signature->signature_id);

        $this->assertNotSame($sourceAttachment->id, $snapshot->id);
        $this->assertSame($user->id, $snapshot->user_id);
        $this->assertTrue($snapshot->is_private);
        $this->assertStringStartsWith("contracts/{$contract->id}/signatures/{$signature->id}/", $snapshot->storage_key);
        Storage::disk('s3')->assertExists($sourceAttachment->storage_key);
        Storage::disk('s3')->assertExists($snapshot->storage_key);
        $this->assertSame('signed', $signature->signature_status);
        $this->assertSame('123456', $signature->verification_code);
    }

    public function test_signing_rejects_a_signature_file_that_does_not_belong_to_the_actor(): void
    {
        Storage::fake('s3');

        $actor = $this->user('09120000008');
        $other = $this->user('09120000009');
        $this->verifyLevelTwo($actor);
        $this->profileSignature($actor, 'users/8/signatures/profile.png');
        $otherAttachment = $this->profileSignature($other, 'users/9/signatures/profile.png');
        $contract = $this->contract($actor, ContractStatus::Active);
        $signature = Signature::query()->create([
            'contract_id' => $contract->id,
            'user_id' => $actor->id,
            'mobile' => $actor->mobile,
            'full_name' => $actor->full_name,
        ]);

        $this->expectException(ValidationException::class);

        app(SignContractAction::class)->execute(
            signature: $signature,
            signatureId: $otherAttachment->id,
            actor: $actor
        );
    }

    public function test_creator_can_cancel_active_contract_and_related_contract_files_are_removed(): void
    {
        Storage::fake('s3');

        $creator = $this->user('09120000010');
        $participant = $this->user('09120000011');
        $this->verifyLevelTwo($creator);
        $contract = $this->contract($creator, ContractStatus::Active);
        $contractAttachment = $this->attachment($creator, "contracts/{$contract->id}/attachments/file.pdf", 'application/pdf');
        $signatureAttachment = $this->attachment($participant, "contracts/{$contract->id}/signatures/1/signature.png", 'image/png');

        ContractAttachment::query()->create([
            'contract_id' => $contract->id,
            'attachment_id' => $contractAttachment->id,
            'sort_order' => 1,
        ]);
        Signature::query()->create([
            'contract_id' => $contract->id,
            'user_id' => $participant->id,
            'mobile' => $participant->mobile,
            'full_name' => $participant->full_name,
            'signature_status' => 'signed',
            'signature_id' => $signatureAttachment->id,
            'signed_at' => now(),
        ]);
        Signature::query()->create([
            'contract_id' => $contract->id,
            'mobile' => '09120000012',
            'full_name' => 'امضا نکرده',
        ]);
        ContractEvent::query()->create([
            'contract_id' => $contract->id,
            'actor_id' => $participant->id,
            'event_type' => ContractEventType::Viewed->value,
            'event_data' => ['signature_id' => 1],
            'occurred_at' => now(),
        ]);
        ContractSnapshot::query()->create([
            'contract_id' => $contract->id,
            'body_hash' => str_repeat('a', 64),
            'payload_hash' => str_repeat('b', 64),
            'canonical_payload' => ['title' => $contract->title],
        ]);

        $this->actingAs($creator, 'sanctum')
            ->postJson("/v1/contracts/{$contract->uuid}/cancel")
            ->assertOk()
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('contracts', [
            'id' => $contract->id,
            'status' => 'cancelled',
        ]);
        $this->assertDatabaseMissing('contract_attachments', ['contract_id' => $contract->id]);
        $this->assertDatabaseMissing('signatures', ['contract_id' => $contract->id]);
        $this->assertDatabaseMissing('contract_events', ['contract_id' => $contract->id]);
        $this->assertDatabaseMissing('contract_snapshots', ['contract_id' => $contract->id]);
        $this->assertDatabaseMissing('attachments', ['id' => $contractAttachment->id]);
        $this->assertDatabaseMissing('attachments', ['id' => $signatureAttachment->id]);
        Storage::disk('s3')->assertMissing($contractAttachment->storage_key);
        Storage::disk('s3')->assertMissing($signatureAttachment->storage_key);

        $this->actingAs($participant, 'sanctum')
            ->getJson("/v1/contracts/{$contract->uuid}")
            ->assertForbidden();
    }

    public function test_active_contract_cannot_be_cancelled_after_all_signatures_are_signed(): void
    {
        $creator = $this->user('09120000013');
        $contract = $this->contract($creator, ContractStatus::Active);
        Signature::query()->create([
            'contract_id' => $contract->id,
            'user_id' => $creator->id,
            'mobile' => $creator->mobile,
            'full_name' => $creator->full_name,
            'signature_status' => 'signed',
            'signed_at' => now(),
        ]);

        $this->actingAs($creator, 'sanctum')
            ->postJson("/v1/contracts/{$contract->uuid}/cancel")
            ->assertUnprocessable()
            ->assertJsonValidationErrors('signatures');
    }

    public function test_creator_can_delete_draft_contract_and_related_rows_and_files_are_removed(): void
    {
        Storage::fake('s3');

        $creator = $this->user('09120000014');
        $contract = $this->contract($creator, ContractStatus::Draft);
        $contractAttachment = $this->attachment($creator, "contracts/{$contract->id}/attachments/draft.pdf", 'application/pdf');

        ContractAttachment::query()->create([
            'contract_id' => $contract->id,
            'attachment_id' => $contractAttachment->id,
            'sort_order' => 1,
        ]);
        Signature::query()->create([
            'contract_id' => $contract->id,
            'mobile' => '09120000015',
            'full_name' => 'طرف پیش‌نویس',
        ]);
        ContractEvent::query()->create([
            'contract_id' => $contract->id,
            'actor_id' => $creator->id,
            'event_type' => ContractEventType::DraftUpdated->value,
            'event_data' => ['title' => $contract->title],
            'occurred_at' => now(),
        ]);

        $this->actingAs($creator, 'sanctum')
            ->deleteJson("/v1/contracts/{$contract->uuid}")
            ->assertNoContent();

        $this->assertDatabaseMissing('contracts', ['id' => $contract->id]);
        $this->assertDatabaseMissing('contract_attachments', ['contract_id' => $contract->id]);
        $this->assertDatabaseMissing('signatures', ['contract_id' => $contract->id]);
        $this->assertDatabaseMissing('contract_events', ['contract_id' => $contract->id]);
        $this->assertDatabaseMissing('attachments', ['id' => $contractAttachment->id]);
        Storage::disk('s3')->assertMissing($contractAttachment->storage_key);
    }

    public function test_non_creator_cannot_delete_draft_contract(): void
    {
        $creator = $this->user('09120000016');
        $other = $this->user('09120000017');
        $contract = $this->contract($creator, ContractStatus::Draft);

        $this->actingAs($other, 'sanctum')
            ->deleteJson("/v1/contracts/{$contract->uuid}")
            ->assertForbidden();

        $this->assertDatabaseHas('contracts', ['id' => $contract->id]);
    }

    public function test_active_contract_cannot_be_deleted_through_draft_delete_endpoint(): void
    {
        $creator = $this->user('09120000018');
        $contract = $this->contract($creator, ContractStatus::Active);

        $this->actingAs($creator, 'sanctum')
            ->deleteJson("/v1/contracts/{$contract->uuid}")
            ->assertForbidden();

        $this->assertDatabaseHas('contracts', ['id' => $contract->id]);
    }

    public function test_cancelled_contract_cannot_be_mutated_by_its_creator(): void
    {
        Storage::fake('s3');

        $creator = $this->user('09120000019');
        $contract = $this->contract($creator, ContractStatus::Cancelled);
        $attachment = $this->attachment($creator, 'contracts/cancelled/source.pdf', 'application/pdf');

        $this->actingAs($creator, 'sanctum')
            ->getJson("/v1/contracts/{$contract->uuid}")
            ->assertOk();

        $this->actingAs($creator, 'sanctum')
            ->patchJson("/v1/contracts/{$contract->uuid}", [
                'title' => 'عنوان جدید',
                'body' => '<p>متن جدید</p>',
            ])
            ->assertForbidden();

        $this->actingAs($creator, 'sanctum')
            ->deleteJson("/v1/contracts/{$contract->uuid}")
            ->assertForbidden();

        $this->actingAs($creator, 'sanctum')
            ->postJson("/v1/contracts/{$contract->uuid}/cancel")
            ->assertForbidden();

        $this->actingAs($creator, 'sanctum')
            ->postJson("/v1/contracts/{$contract->uuid}/attachments", [
                'attachment_id' => $attachment->id,
            ])
            ->assertForbidden();
    }

    private function user(string $mobile, string $firstName = 'علی', string $lastName = 'احمدی'): User
    {
        return User::query()->create([
            'first_name' => $firstName,
            'last_name' => $lastName,
            'mobile' => $mobile,
            'email' => "{$mobile}@example.test",
            'password' => 'password',
            'role' => 'user',
        ]);
    }

    private function verifyLevelTwo(User $user): void
    {
        $user->verification()->create([
            'verified_level' => 2,
            'mobile_verified' => true,
            'mobile_verified_at' => now(),
            'national_verified' => true,
            'national_verified_at' => now(),
        ]);
    }

    private function contract(User $creator, ContractStatus $status): Contract
    {
        return Contract::query()->create([
            'uuid' => (string) Str::uuid(),
            'creator_id' => $creator->id,
            'title' => 'قرارداد تست',
            'body' => '<p>متن قرارداد</p>',
            'status' => $status->value,
        ]);
    }

    private function profileSignature(User $user, string $storageKey): Attachment
    {
        Storage::disk('s3')->put($storageKey, 'signature-bytes', [
            'visibility' => 'private',
        ]);

        $attachment = Attachment::query()->create([
            'user_id' => $user->id,
            'storage_key' => $storageKey,
            'original_name' => basename($storageKey),
            'mime_type' => 'image/png',
            'size_bytes' => strlen('signature-bytes'),
            'is_private' => true,
            'created_at' => now(),
        ]);

        $user->profile()->create([
            'signature_id' => $attachment->id,
        ]);

        return $attachment;
    }

    private function attachment(User $user, string $storageKey, string $mimeType): Attachment
    {
        Storage::disk('s3')->put($storageKey, 'file-bytes', [
            'visibility' => 'private',
        ]);

        return Attachment::query()->create([
            'user_id' => $user->id,
            'storage_key' => $storageKey,
            'original_name' => basename($storageKey),
            'mime_type' => $mimeType,
            'size_bytes' => strlen('file-bytes'),
            'is_private' => true,
            'created_at' => now(),
        ]);
    }
}
