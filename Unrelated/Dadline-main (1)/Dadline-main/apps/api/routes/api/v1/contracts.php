<?php

use App\Http\Controllers\Api\Contracts\ContractAiAnalysisController;
use App\Http\Controllers\Api\Contracts\ContractAttachmentController;
use App\Http\Controllers\Api\Contracts\ContractController;
use App\Http\Controllers\Api\Contracts\ContractEventController;
use App\Http\Controllers\Api\Contracts\ContractEvidenceReportController;
use App\Http\Controllers\Api\Contracts\ContractExportController;
use App\Http\Controllers\Api\Contracts\ContractInvitationController;
use App\Http\Controllers\Api\Contracts\ContractPaymentController;
use App\Http\Controllers\Api\Contracts\ContractPinController;
use App\Http\Controllers\Api\Contracts\ContractSnapshotController;
use App\Http\Controllers\Api\Contracts\ContractVerificationController;
use App\Http\Controllers\Api\Contracts\ContractWorkflowController;
use App\Http\Controllers\Api\Contracts\SignatureController;
use App\Http\Controllers\Api\Contracts\SignatureOtpController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Contracts (قراردادها)
|--------------------------------------------------------------------------
| هر کاربر ثبت‌نام‌شده می‌تواند قرارداد بسازد، پیش‌نویس خودش را ویرایش کند،
| طرفین و پیوست‌ها را مدیریت کند، پرداخت انجام دهد، امضا کند و گزارش بگیرد.
| محدودیت‌ها بر اساس نقش کاربر در همان قرارداد اعمال می‌شود: سازنده، امضاکننده یا ادمین.
|
| مسیر نهایی: api.dadline.net/v1/contracts/...
*/

Route::prefix('contracts')->middleware('auth:sanctum')->group(function () {
    Route::get('/', [ContractController::class, 'index'])->name('contracts.index');
    Route::post('/', [ContractController::class, 'store'])->name('contracts.store');
    Route::get('/{contract:uuid}', [ContractController::class, 'show'])->name('contracts.show');
    Route::patch('/{contract:uuid}', [ContractController::class, 'update'])->name('contracts.update');
    Route::delete('/{contract:uuid}', [ContractController::class, 'destroy'])->name('contracts.destroy');

    Route::post('/{contract:uuid}/pin', [ContractPinController::class, 'refresh'])->name('contracts.pin.refresh');
    Route::post('/{contract:uuid}/verify-pin', [ContractPinController::class, 'verify'])->name('contracts.pin.verify');

    Route::get('/{contract:uuid}/attachments', [ContractAttachmentController::class, 'index'])->name('contracts.attachments.index');
    Route::post('/{contract:uuid}/attachments', [ContractAttachmentController::class, 'store'])->name('contracts.attachments.store');
    Route::post('/{contract:uuid}/attachments/upload', [ContractAttachmentController::class, 'upload'])->name('contracts.attachments.upload');
    Route::delete('/{contract:uuid}/attachments/{contractAttachment}', [ContractAttachmentController::class, 'destroy'])->name('contracts.attachments.destroy');

    Route::get('/{contract:uuid}/signatures', [SignatureController::class, 'index'])->name('contracts.signatures.index');
    Route::post('/{contract:uuid}/signatures', [SignatureController::class, 'store'])->name('contracts.signatures.store');
    Route::patch('/{contract:uuid}/signatures/{signature}', [SignatureController::class, 'update'])->name('contracts.signatures.update');
    Route::delete('/{contract:uuid}/signatures/{signature}', [SignatureController::class, 'destroy'])->name('contracts.signatures.destroy');
    Route::post('/{contract:uuid}/signatures/{signature}/sign', [SignatureController::class, 'sign'])->name('contracts.signatures.sign');

    Route::post('/{contract:uuid}/payment', [ContractPaymentController::class, 'store'])->name('contracts.payment.store');
    Route::get('/{contract:uuid}/payment', [ContractPaymentController::class, 'show'])->name('contracts.payment.show');
    Route::get('/{contract:uuid}/pricing', [ContractPaymentController::class, 'pricing'])->name('contracts.pricing.show');
    Route::post('/{contract:uuid}/invitations/send', [ContractInvitationController::class, 'send'])->name('contracts.invitations.send');
    Route::post('/{contract:uuid}/signatures/{signature}/invitation/resend', [ContractInvitationController::class, 'resend'])->name('contracts.signatures.invitation.resend');

    Route::post('/{contract:uuid}/signatures/{signature}/otp/send', [SignatureOtpController::class, 'send'])->name('contracts.signatures.otp.send');
    Route::post('/{contract:uuid}/signatures/{signature}/otp/verify', [SignatureOtpController::class, 'verify'])->name('contracts.signatures.otp.verify');

    Route::post('/{contract:uuid}/complete', [ContractWorkflowController::class, 'complete'])->name('contracts.complete');
    Route::post('/{contract:uuid}/cancel', [ContractWorkflowController::class, 'cancel'])->name('contracts.cancel');

    Route::post('/{contract:uuid}/ai/analyze', [ContractAiAnalysisController::class, 'store'])->name('contracts.ai.analyze');
    Route::get('/{contract:uuid}/ai/pricing', [ContractAiAnalysisController::class, 'pricing'])->name('contracts.ai.pricing');
    Route::get('/{contract:uuid}/ai/analysis', [ContractAiAnalysisController::class, 'show'])->name('contracts.ai.analysis.show');

    Route::post('/{contract:uuid}/viewed', [ContractEventController::class, 'viewed'])->name('contracts.viewed');
    Route::get('/{contract:uuid}/events', [ContractEventController::class, 'index'])->name('contracts.events.index');
    Route::get('/{contract:uuid}/snapshot', [ContractSnapshotController::class, 'show'])->name('contracts.snapshot.show');
    Route::get('/{contract:uuid}/evidence-report', ContractEvidenceReportController::class)->name('contracts.evidence-report');

    Route::get('/{contract:uuid}/export/pdf', [ContractExportController::class, 'pdf'])->name('contracts.export.pdf');
    Route::get('/{contract:uuid}/verify-data', [ContractVerificationController::class, 'show'])->name('contracts.verify-data');
});
