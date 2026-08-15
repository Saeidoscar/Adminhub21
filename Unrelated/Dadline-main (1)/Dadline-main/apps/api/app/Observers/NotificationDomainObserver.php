<?php

namespace App\Observers;

use App\Enums\PurchaseIntentStatus;
use App\Enums\ServiceOfferStatus;
use App\Enums\ServiceRequestStatus;
use App\Enums\ServiceResultStatus;
use App\Enums\WalletTransactionStatus;
use App\Enums\WalletTransactionType;
use App\Models\OfficeCaseTask;
use App\Models\PayoutSettlement;
use App\Models\PhoneConsultation;
use App\Models\PurchaseIntent;
use App\Models\QuestionAnswer;
use App\Models\Review;
use App\Models\ServiceOffer;
use App\Models\ServiceRequest;
use App\Models\ServiceResult;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\WalletTransaction;
use App\Services\Notifications\DomainNotificationService;
use Illuminate\Contracts\Events\ShouldHandleEventsAfterCommit;
use Illuminate\Database\Eloquent\Model;

class NotificationDomainObserver implements ShouldHandleEventsAfterCommit
{
    public function __construct(
        private readonly DomainNotificationService $notifications
    ) {}

    public function created(Model $model): void
    {
        match (true) {
            $model instanceof WalletTransaction => $this->walletTransactionCreated($model),
            $model instanceof PayoutSettlement => $this->notifications->settlementRequested($model),
            $model instanceof ServiceRequest => $this->notifications->serviceRequestSubmitted($model),
            $model instanceof ServiceOffer => $this->notifications->serviceOfferCreated($model),
            $model instanceof ServiceResult => $this->notifications->serviceResultPublished($model),
            $model instanceof Ticket => $this->notifications->ticketCreated($model),
            $model instanceof TicketMessage => $this->notifications->ticketMessageCreated($model),
            $model instanceof Review => $this->notifications->reviewCreated($model),
            $model instanceof QuestionAnswer => $this->notifications->questionAnswerCreated($model),
            $model instanceof OfficeCaseTask => $this->notifications->officeTaskCreated($model),
            $model instanceof PhoneConsultation => $this->notifications->phoneConsultationCreated($model),
            default => null,
        };
    }

    public function updated(Model $model): void
    {
        match (true) {
            $model instanceof WalletTransaction && $model->wasChanged('status') => $this->walletTransactionUpdated($model),
            $model instanceof PayoutSettlement && $model->wasChanged('status') => $this->notifications->settlementStatusChanged($model),
            $model instanceof PurchaseIntent && $model->wasChanged('status') => $this->purchaseIntentUpdated($model),
            $model instanceof ServiceRequest && $model->wasChanged('status') && $model->status === ServiceRequestStatus::Submitted => $this->notifications->serviceRequestSubmitted($model),
            $model instanceof ServiceOffer && $model->wasChanged('status') && $model->status === ServiceOfferStatus::Accepted => $this->notifications->serviceOfferAccepted($model),
            $model instanceof ServiceResult && $model->wasChanged('status') && $model->status === ServiceResultStatus::Publish => $this->notifications->serviceResultPublished($model),
            $model instanceof PhoneConsultation && $model->wasChanged('status') => $this->notifications->phoneConsultationStatusChanged($model),
            $model instanceof Ticket => $this->notifications->ticketUpdated($model),
            default => null,
        };
    }

    private function walletTransactionCreated(WalletTransaction $transaction): void
    {
        if ($transaction->status === WalletTransactionStatus::Completed) {
            $this->notifications->walletTransactionCreated($transaction);
        }

        if (
            $transaction->type === WalletTransactionType::SmsCharge
            && $transaction->status === WalletTransactionStatus::Completed
            && ! (bool) ($transaction->payload['sms_balance_recharged'] ?? false)
        ) {
            $transaction->loadMissing('user');
            $units = (int) ($transaction->payload['sms_units'] ?? $transaction->payload['units'] ?? 0);

            if ($units > 0 && $transaction->user !== null) {
                $this->notifications->smsPackagePurchased($transaction, $transaction->user, $units);
            }
        }
    }

    private function walletTransactionUpdated(WalletTransaction $transaction): void
    {
        if ($transaction->status === WalletTransactionStatus::Completed) {
            $this->walletTransactionCreated($transaction);
        }
    }

    private function purchaseIntentUpdated(PurchaseIntent $intent): void
    {
        if ($intent->status !== PurchaseIntentStatus::Completed) {
            return;
        }

        $this->notifications->purchaseCompleted($intent);

        if (
            $intent->wallet_type === WalletTransactionType::SmsCharge
            && ! (bool) ($intent->payload['sms_balance_recharged'] ?? false)
        ) {
            $intent->loadMissing('user');
            $units = (int) ($intent->payload['sms_units'] ?? $intent->payload['units'] ?? 0);

            if ($units > 0 && $intent->user !== null) {
                $this->notifications->smsPackagePurchased($intent, $intent->user, $units);
            }
        }
    }
}
