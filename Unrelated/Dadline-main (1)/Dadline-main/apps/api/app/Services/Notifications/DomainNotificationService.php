<?php

namespace App\Services\Notifications;

use App\Enums\NotificationCategory;
use App\Enums\NotificationChannel;
use App\Enums\NotificationPriority;
use App\Enums\PhoneConsultationStatus;
use App\Enums\PayoutSettlementStatus;
use App\Enums\QuestionAnswerStatus;
use App\Enums\QuestionStatus;
use App\Enums\ServiceOfferStatus;
use App\Enums\ServiceRequestStatus;
use App\Enums\ServiceRequestType;
use App\Enums\ServiceResultStatus;
use App\Enums\WalletTransactionDirection;
use App\Enums\WalletTransactionStatus;
use App\Enums\UserRole;
use App\Jobs\Notifications\AnnounceFirstLegalQuestionAnswerJob;
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
use App\Models\User;
use App\Models\WalletTransaction;
use App\Services\Notifications\Data\NotificationDispatchData;
use Illuminate\Support\Facades\Bus;

class DomainNotificationService
{
    public function __construct(
        private readonly NotificationDispatcher $notifications
    ) {}

    public function walletTransactionCreated(WalletTransaction $transaction): void
    {
        if ($transaction->status !== WalletTransactionStatus::Completed) {
            return;
        }

        $transaction->loadMissing('user');

        if (! $transaction->user instanceof User) {
            return;
        }

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $transaction->user,
            recipient: null,
            templateKey: 'wallet.transaction.created',
            context: [
                'transaction_id' => $transaction->id,
                'direction' => $transaction->direction?->label() ?? $this->directionLabel($transaction->direction),
                'amount' => $this->money($transaction->amount),
                'description' => $transaction->typeLabel(),
                'status' => $transaction->status?->label() ?? 'تکمیل‌شده',
                'message' => $this->transactionMessage($transaction),
            ],
            channels: $this->standardChannels(),
            eventKey: 'wallet.transaction.created',
            category: NotificationCategory::Payment,
            priority: NotificationPriority::High,
            critical: true,
            dedupeKey: 'wallet.transaction.created:'.$transaction->id,
        ));
    }

    public function purchaseCompleted(PurchaseIntent $intent): void
    {
        $intent->loadMissing('user');

        if (! $intent->user instanceof User) {
            return;
        }

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $intent->user,
            recipient: null,
            templateKey: 'purchase.completed',
            context: [
                'purchase_intent_id' => $intent->id,
                'purchase_type' => $intent->purchase_type,
                'amount' => $this->money($intent->amount),
                'message' => "پرداخت {$this->money($intent->amount)} تومان با موفقیت تکمیل شد.",
            ],
            channels: $this->standardChannels(),
            eventKey: 'purchase.completed',
            category: NotificationCategory::Payment,
            priority: NotificationPriority::High,
            critical: true,
            dedupeKey: 'purchase.completed:'.$intent->id,
        ));
    }

    public function settlementRequested(PayoutSettlement $settlement): void
    {
        $settlement->loadMissing('transaction.user');
        $user = $settlement->transaction?->user;

        if (! $user instanceof User) {
            return;
        }

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $user,
            recipient: null,
            templateKey: 'settlement.requested',
            context: [
                'settlement_id' => $settlement->id,
                'amount' => $this->money($settlement->amount),
                'payable_amount' => $this->money($settlement->total_payable),
                'message' => "درخواست تسویه حساب {$this->money($settlement->amount)} تومان ثبت شد.",
            ],
            channels: $this->standardChannels(),
            eventKey: 'settlement.requested',
            category: NotificationCategory::Payment,
            priority: NotificationPriority::High,
            dedupeKey: 'settlement.requested:'.$settlement->id,
        ));
    }

    public function settlementStatusChanged(PayoutSettlement $settlement): void
    {
        if (! in_array($settlement->status, [
            PayoutSettlementStatus::Completed,
            PayoutSettlementStatus::Failed,
            PayoutSettlementStatus::Reversed,
        ], true)) {
            return;
        }

        $settlement->loadMissing('transaction.user');
        $user = $settlement->transaction?->user;

        if (! $user instanceof User) {
            return;
        }

        $templateKey = match ($settlement->status) {
            PayoutSettlementStatus::Completed => 'settlement.completed',
            PayoutSettlementStatus::Reversed => 'settlement.reversed',
            default => 'settlement.failed',
        };

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $user,
            recipient: null,
            templateKey: $templateKey,
            context: [
                'settlement_id' => $settlement->id,
                'tracker_id' => $settlement->track_id ?? '-',
                'amount' => $this->money($settlement->amount),
                'payable_amount' => $this->money($settlement->total_payable),
                'error' => $settlement->failure_reason ?? '-',
                'message' => $settlement->status->label(),
            ],
            channels: $this->standardChannels(),
            eventKey: $templateKey,
            category: NotificationCategory::Payment,
            priority: NotificationPriority::High,
            critical: $settlement->status !== PayoutSettlementStatus::Completed,
            dedupeKey: $templateKey.':'.$settlement->id,
        ));
    }

    public function serviceRequestSubmitted(ServiceRequest $request): void
    {
        if ($request->status !== ServiceRequestStatus::Submitted) {
            return;
        }

        $request->loadMissing(['requester', 'category']);

        if (! $request->requester instanceof User) {
            return;
        }

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $request->requester,
            recipient: null,
            templateKey: 'service.request.submitted',
            context: [
                'request_id' => $request->id,
                'title' => $request->title,
                'category' => $request->category?->name ?? '',
                'message' => "درخواست {$request->title} با موفقیت ثبت شد.",
            ],
            channels: $this->standardChannels(),
            eventKey: 'service.request.submitted',
            category: NotificationCategory::System,
            priority: NotificationPriority::Normal,
            dedupeKey: 'service.request.submitted:'.$request->id,
        ));
    }

    public function serviceOfferCreated(ServiceOffer $offer): void
    {
        $offer->loadMissing(['request.requester', 'vendor']);
        $request = $offer->request;
        $requester = $request?->requester;

        if (! $requester instanceof User) {
            return;
        }

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $requester,
            recipient: $requester->mobile,
            templateKey: $this->offerCreatedKey($request),
            context: [
                'name' => $requester->full_name,
                'vendor' => $offer->vendor?->full_name,
                'title' => $request?->title,
                'price' => $this->money($offer->price),
                'message' => "پیشنهاد جدیدی برای {$request?->title} ثبت شد.",
            ],
            channels: $this->smsAndStandardChannels(),
            eventKey: 'service.offer.created',
            category: NotificationCategory::System,
            priority: NotificationPriority::High,
            dedupeKey: 'service.offer.created:'.$offer->id,
        ));
    }

    public function serviceOfferAccepted(ServiceOffer $offer): void
    {
        if ($offer->status !== ServiceOfferStatus::Accepted) {
            return;
        }

        $offer->loadMissing(['request.category', 'vendor']);

        if (! $offer->vendor instanceof User) {
            return;
        }

        $templateKey = match ($offer->request?->type) {
            ServiceRequestType::Document => 'document.offer.accepted',
            ServiceRequestType::Lawlink => 'lawlink.offer.accepted',
            default => 'case.offer.accepted',
        };

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $offer->vendor,
            recipient: $offer->vendor->mobile,
            templateKey: $templateKey,
            context: [
                'name' => $offer->vendor->full_name,
                'case' => $offer->request?->title,
                'case_title' => $offer->request?->title,
                'case_id' => $offer->request_id,
                'document' => $offer->request?->title,
                'document_title' => $offer->request?->title,
                'document_id' => $offer->request_id,
                'request' => $offer->request?->title,
                'request_title' => $offer->request?->title,
                'request_id' => $offer->request_id,
                'message' => "پیشنهاد شما در {$offer->request?->title} پذیرفته شد.",
            ],
            channels: $this->smsAndStandardChannels(),
            eventKey: 'service.offer.accepted',
            category: NotificationCategory::System,
            priority: NotificationPriority::High,
            dedupeKey: 'service.offer.accepted:'.$offer->id,
        ));
    }

    public function serviceResultPublished(ServiceResult $result): void
    {
        if ($result->status !== ServiceResultStatus::Publish) {
            return;
        }

        $result->loadMissing(['request.requester', 'vendor']);
        $request = $result->request;
        $requester = $request?->requester;

        if (! $requester instanceof User) {
            return;
        }

        $templateKey = $request?->type === ServiceRequestType::Document
            ? 'document.result.submitted'
            : 'case.result.submitted';

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $requester,
            recipient: $requester->mobile,
            templateKey: $templateKey,
            context: [
                'name' => $requester->full_name,
                'case_title' => $request?->title,
                'case_id' => $request?->id,
                'document_title' => $request?->title,
                'document_id' => $request?->id,
                'vendor' => $result->vendor?->full_name,
                'vendor_name' => $result->vendor?->full_name,
                'message' => "نتیجه {$request?->title} توسط کارشناس ثبت شد.",
            ],
            channels: $this->smsAndStandardChannels(),
            eventKey: 'service.result.published',
            category: NotificationCategory::System,
            priority: NotificationPriority::High,
            dedupeKey: 'service.result.published:'.$result->id,
        ));
    }

    public function ticketCreated(Ticket $ticket): void
    {
        $ticket->loadMissing(['sender', 'department.supporters']);

        if (! $ticket->sender instanceof User) {
            return;
        }

        $priority = $ticket->priority?->value === 'urgent'
            ? NotificationPriority::Critical
            : NotificationPriority::Normal;

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $ticket->sender,
            recipient: null,
            templateKey: 'ticket.created',
            context: [
                'ticket_id' => $ticket->uuid,
                'title' => $ticket->title,
                'department' => $ticket->department?->label() ?? '',
                'priority' => $ticket->priority?->label() ?? '',
                'message' => "تیکت {$ticket->title} با موفقیت ثبت شد.",
                'link' => '/pishkhan/tickets/'.$ticket->uuid,
            ],
            channels: $this->standardChannels(),
            eventKey: 'ticket.created',
            category: NotificationCategory::System,
            priority: $priority,
            critical: $priority === NotificationPriority::Critical,
            dedupeKey: 'ticket.created:'.$ticket->id,
            metadata: [
                'button_text' => 'مشاهده تیکت',
                'link' => '/pishkhan/tickets/'.$ticket->uuid,
            ],
        ));

        foreach ($this->ticketStaffTargets($ticket) as $supporter) {
            $this->notifications->dispatch(new NotificationDispatchData(
                user: $supporter,
                recipient: null,
                templateKey: 'ticket.staff.created',
                context: [
                    'ticket_id' => $ticket->uuid,
                    'title' => $ticket->title,
                    'user_name' => $ticket->sender->full_name,
                    'department' => $ticket->department?->label() ?? '',
                    'priority' => $ticket->priority?->label() ?? '',
                    'message' => "تیکت جدیدی توسط {$ticket->sender->full_name} ثبت شد.",
                    'link' => '/tickets/'.$ticket->uuid,
                ],
                channels: $priority === NotificationPriority::Critical
                    ? $this->smsAndStandardChannels()
                    : $this->standardChannels(),
                eventKey: 'ticket.staff.created',
                category: NotificationCategory::System,
                priority: $priority,
                critical: $priority === NotificationPriority::Critical,
                dedupeKey: 'ticket.staff.created:'.$ticket->id.':'.$supporter->id,
                metadata: [
                    'button_text' => 'رسیدگی به تیکت',
                    'link' => '/tickets/'.$ticket->uuid,
                ],
            ));
        }
    }

    public function ticketMessageCreated(TicketMessage $message): void
    {
        $message->loadMissing([
            'ticket.sender',
            'ticket.provider',
            'ticket.assignedTo',
            'ticket.department.supporters',
            'user',
        ]);
        $ticket = $message->ticket;

        if (! $ticket instanceof Ticket || ! $message->user instanceof User) {
            return;
        }

        $isInitialMessage = (int) $ticket->messages()
            ->where('is_internal', false)
            ->min('id') === (int) $message->id;

        if ($isInitialMessage) {
            return;
        }

        if ($message->is_internal) {
            $targets = $this->ticketStaffTargets($ticket)
                ->reject(fn (User $user) => (int) $user->id === (int) $message->user_id);
            $templateKey = 'ticket.internal_note.created';
            $channels = $this->standardChannels();
        } elseif ($message->from_admin) {
            $targets = collect([$ticket->sender, $ticket->provider]);
            $templateKey = 'ticket.staff.message';
            $channels = $this->smsAndStandardChannels();
        } elseif ((int) $ticket->provider_id === (int) $message->user_id) {
            $targets = collect([$ticket->sender])->merge($this->ticketStaffTargets($ticket));
            $templateKey = 'ticket.provider.message';
            $channels = $this->standardChannels();
        } else {
            $targets = collect([$ticket->provider])->merge($this->ticketStaffTargets($ticket));
            $templateKey = 'ticket.user.message';
            $channels = $this->standardChannels();
        }

        $targets = $targets
            ->filter(fn ($user): bool => $user instanceof User && (int) $user->id !== (int) $message->user_id)
            ->unique('id');

        if (! $message->is_internal && $ticket->priority?->value === 'urgent') {
            $channels = $this->smsAndStandardChannels();
        }

        foreach ($targets as $target) {
            $isStaff = $target->role === UserRole::ADMIN;
            $link = $isStaff
                ? '/tickets/'.$ticket->uuid
                : '/pishkhan/tickets/'.$ticket->uuid;

            $this->notifications->dispatch(new NotificationDispatchData(
                user: $target,
                recipient: $target->mobile,
                templateKey: $templateKey,
                context: [
                    'ticket_id' => $ticket->uuid,
                    'ticket_title' => $ticket->title,
                    'actor_name' => $message->user->full_name,
                    'admin_name' => $message->user->full_name,
                    'message' => str($message->body)->limit(500)->toString(),
                    'link' => $link,
                ],
                channels: $channels,
                eventKey: 'ticket.message.created',
                category: NotificationCategory::System,
                priority: $ticket->priority?->value === 'urgent'
                    ? NotificationPriority::Critical
                    : NotificationPriority::Normal,
                critical: $ticket->priority?->value === 'urgent',
                dedupeKey: 'ticket.message.created:'.$message->id.':'.$target->id,
                metadata: [
                    'button_text' => $isStaff ? 'پاسخ‌گویی' : 'مشاهده پاسخ',
                    'link' => $link,
                ],
            ));
        }
    }

    public function ticketUpdated(Ticket $ticket): void
    {
        $fields = [
            'department_id' => 'دپارتمان',
            'assigned_to_id' => 'پشتیبان مسئول',
            'provider_id' => 'وکیل یا کارشناس متصل',
            'status' => 'وضعیت',
            'priority' => 'اولویت',
        ];
        $changed = collect($fields)->filter(fn (string $label, string $field) => $ticket->wasChanged($field));

        if ($changed->isEmpty()) {
            return;
        }

        $ticket->loadMissing([
            'sender',
            'provider',
            'assignedTo',
            'department.supporters',
        ]);
        $previous = $ticket->notificationPrevious
            ?: (method_exists($ticket, 'getPrevious') ? $ticket->getPrevious() : []);

        $targets = collect([$ticket->sender, $ticket->provider])
            ->merge($this->ticketStaffTargets($ticket));

        if ($changed->has('provider_id') && filled($previous['provider_id'] ?? null)) {
            $targets->push(User::query()->find($previous['provider_id']));
        }

        if ($changed->has('assigned_to_id') && filled($previous['assigned_to_id'] ?? null)) {
            $targets->push(User::query()->find($previous['assigned_to_id']));
        }

        if ($changed->has('department_id') && filled($previous['department_id'] ?? null)) {
            $previousDepartment = \App\Models\TicketDepartment::query()
                ->with('supporters')
                ->find($previous['department_id']);
            $targets = $targets->merge($previousDepartment?->supporters ?? collect());
        }

        $targets = $targets
            ->filter(fn ($user): bool => $user instanceof User)
            ->reject(fn (User $user): bool => (int) $user->id === (int) $ticket->notificationActorId)
            ->unique('id');

        foreach ($changed as $field => $label) {
            $previousValue = $previous[$field] ?? $ticket->getOriginal($field);
            $from = $this->ticketFieldLabel($field, $previousValue);
            $to = $this->ticketFieldLabel($field, $ticket->getAttribute($field));
            $priority = $field === 'priority' && $ticket->priority?->value === 'urgent'
                ? NotificationPriority::Critical
                : NotificationPriority::Normal;

            foreach ($targets as $target) {
                $isStaff = $target->role === UserRole::ADMIN;
                $isRemovedProvider = $field === 'provider_id'
                    && (int) $target->id === (int) ($previous['provider_id'] ?? 0)
                    && (int) $target->id !== (int) $ticket->provider_id;
                $link = $isStaff
                    ? '/tickets/'.$ticket->uuid
                    : ($isRemovedProvider ? '/pishkhan/tickets' : '/pishkhan/tickets/'.$ticket->uuid);

                $this->notifications->dispatch(new NotificationDispatchData(
                    user: $target,
                    recipient: null,
                    templateKey: 'ticket.updated',
                    context: [
                        'ticket_id' => $ticket->uuid,
                        'ticket_title' => $ticket->title,
                        'field' => $label,
                        'from' => $from,
                        'to' => $to,
                        'message' => "{$label} تیکت از {$from} به {$to} تغییر کرد.",
                        'link' => $link,
                    ],
                    channels: $priority === NotificationPriority::Critical
                        ? $this->smsAndStandardChannels()
                        : $this->standardChannels(),
                    eventKey: 'ticket.updated.'.$field,
                    category: NotificationCategory::System,
                    priority: $priority,
                    critical: $priority === NotificationPriority::Critical,
                    dedupeKey: 'ticket.updated:'.$ticket->id.':'.$field.':'.hash('sha256', $from.'|'.$to).':'.$target->id,
                    metadata: [
                        'button_text' => $isRemovedProvider ? 'مشاهده فهرست تیکت‌ها' : 'مشاهده تیکت',
                        'link' => $link,
                    ],
                ));
            }
        }
    }

    public function reviewCreated(Review $review): void
    {
        $review->loadMissing('vendor');

        if (! $review->vendor instanceof User) {
            return;
        }

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $review->vendor,
            recipient: null,
            templateKey: 'review.created',
            context: [
                'review_id' => $review->id,
                'service_type' => $review->type,
                'rating' => $review->rate,
                'review' => $review->review,
                'message' => "دیدگاه جدیدی با {$review->rate} ستاره برای شما ثبت شد.",
            ],
            channels: $this->standardChannels(),
            eventKey: 'review.created',
            category: NotificationCategory::System,
            priority: NotificationPriority::Normal,
            dedupeKey: 'review.created:'.$review->id,
        ));
    }

    public function questionAnswerCreated(QuestionAnswer $answer): void
    {
        $answer->loadMissing(['question.user', 'vendor']);

        if (
            $answer->status === QuestionAnswerStatus::Approved
            && $answer->question?->status === QuestionStatus::Publish
            && ! $answer->question?->is_private
            && $answer->vendor?->isLawyer()
        ) {
            Bus::dispatch(
                (new AnnounceFirstLegalQuestionAnswerJob($answer->id))
                    ->onQueue(NotificationPriority::Normal->queue())
                    ->afterCommit()
            );
        }

        $user = $answer->question?->user;

        if (! $user instanceof User) {
            return;
        }

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $user,
            recipient: $user->mobile,
            templateKey: 'question.answer.created',
            context: [
                'question_id' => $answer->question_id,
                'question_title' => $answer->question?->title,
                'vendor' => $answer->vendor?->full_name,
                'vendor_name' => $answer->vendor?->full_name,
                'message' => 'پاسخ جدیدی روی سوال شما ثبت شد.',
            ],
            channels: $this->smsAndStandardChannels(),
            eventKey: 'question.answer.created',
            category: NotificationCategory::System,
            priority: NotificationPriority::Normal,
            dedupeKey: 'question.answer.created:'.$answer->id,
        ));
    }

    public function officeTaskCreated(OfficeCaseTask $task): void
    {
        $task->loadMissing(['assignee', 'officeCase']);

        if (! $task->assignee instanceof User) {
            return;
        }

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $task->assignee,
            recipient: null,
            templateKey: 'office.task.created',
            context: [
                'task_id' => $task->id,
                'title' => $task->title,
                'case_title' => $task->officeCase?->title,
                'message' => "اقدام جدیدی با عنوان {$task->title} برای شما ثبت شد.",
            ],
            channels: $this->standardChannels(),
            eventKey: 'office.task.created',
            category: NotificationCategory::System,
            priority: NotificationPriority::Normal,
            dedupeKey: 'office.task.created:'.$task->id,
        ));
    }

    public function phoneConsultationCreated(PhoneConsultation $consultation): void
    {
        $consultation->loadMissing(['vendor', 'user', 'category']);

        if (! $consultation->vendor instanceof User) {
            return;
        }

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $consultation->vendor,
            recipient: $consultation->vendor->mobile,
            templateKey: 'consultation.vip_call.created',
            context: [
                'category' => $consultation->category?->name,
                'duration' => $consultation->minutes,
                'client_name' => $consultation->user?->full_name,
                'message' => "مشاوره تلفنی جدیدی به مدت {$consultation->minutes} دقیقه ثبت شد.",
            ],
            channels: $this->smsAndStandardChannels(),
            eventKey: 'consultation.created',
            category: NotificationCategory::System,
            priority: NotificationPriority::High,
            dedupeKey: 'consultation.created:'.$consultation->id,
        ));
    }

    public function phoneConsultationStatusChanged(PhoneConsultation $consultation): void
    {
        if (! $consultation->wasChanged('status')) {
            return;
        }

        $consultation->loadMissing(['vendor', 'user']);

        if (! $consultation->user instanceof User) {
            return;
        }

        $templateKey = match ($consultation->status) {
            PhoneConsultationStatus::CALLING => 'consultation.call.accepted',
            PhoneConsultationStatus::ANSWERED => 'consultation.call.completed',
            default => null,
        };

        if ($templateKey === null) {
            return;
        }

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $consultation->user,
            recipient: $consultation->user->mobile,
            templateKey: $templateKey,
            context: [
                'name' => $consultation->user->full_name,
                'vendor_name' => $consultation->vendor?->full_name,
                'vendor_role' => $consultation->vendor?->role_label,
                'message' => $consultation->status === PhoneConsultationStatus::CALLING
                    ? 'درخواست مشاوره تلفنی شما پذیرفته شد.'
                    : 'لطفا دیدگاه خود را درباره مشاوره تلفنی ثبت کنید.',
            ],
            channels: $this->smsAndStandardChannels(),
            eventKey: 'consultation.status.changed',
            category: NotificationCategory::System,
            priority: NotificationPriority::High,
            dedupeKey: 'consultation.status.changed:'.$consultation->id.':'.$consultation->status->value,
        ));
    }

    public function smsPackagePurchased(PurchaseIntent|WalletTransaction $source, User $user, int $units): void
    {
        app(SmsBalanceService::class)->recharge($user, $units);

        $this->notifications->dispatch(new NotificationDispatchData(
            user: $user,
            recipient: null,
            templateKey: 'sms.balance.recharged',
            context: [
                'units' => $units,
                'message' => "بسته پیامکی شما با {$units} واحد شارژ شد و ارسال پیامک دوباره فعال شد.",
            ],
            channels: $this->standardChannels(),
            eventKey: 'sms.balance.recharged',
            category: NotificationCategory::System,
            priority: NotificationPriority::Normal,
            dedupeKey: 'sms.balance.recharged:'.class_basename($source).':'.$source->id,
        ));
    }

    /**
     * @return \Illuminate\Support\Collection<int, User>
     */
    private function ticketStaffTargets(Ticket $ticket)
    {
        $targets = collect([$ticket->assignedTo])
            ->merge($ticket->department?->supporters ?? collect())
            ->filter(fn ($user): bool => $user instanceof User)
            ->unique('id');

        if ($targets->isNotEmpty()) {
            return $targets;
        }

        return User::query()->where('role', UserRole::ADMIN->value)->get()->unique('id');
    }

    private function ticketFieldLabel(string $field, mixed $value): string
    {
        if ($value instanceof \BackedEnum) {
            $value = $value->value;
        }

        if ($value === null || $value === '') {
            return 'تعیین‌نشده';
        }

        return match ($field) {
            'department_id' => \App\Models\TicketDepartment::query()->find($value)?->label() ?? 'نامشخص',
            'assigned_to_id', 'provider_id' => User::query()->find($value)?->full_name ?? 'حذف‌شده',
            'status' => \App\Enums\TicketStatus::tryFrom((string) $value)?->label() ?? (string) $value,
            'priority' => \App\Enums\TicketPriority::tryFrom((string) $value)?->label() ?? (string) $value,
            default => (string) $value,
        };
    }

    /**
     * @return array<int, NotificationChannel>
     */
    private function standardChannels(): array
    {
        return [
            NotificationChannel::Database,
            NotificationChannel::Push,
            NotificationChannel::Telegram,
            NotificationChannel::Bale,
            NotificationChannel::Eitaa,
            NotificationChannel::Email,
        ];
    }

    /**
     * @return array<int, NotificationChannel>
     */
    private function smsAndStandardChannels(): array
    {
        return [
            NotificationChannel::Sms,
            ...$this->standardChannels(),
        ];
    }

    private function offerCreatedKey(?ServiceRequest $request): string
    {
        return match ($request?->type) {
            ServiceRequestType::Document => 'doc_offer_code',
            default => 'case_offer_code',
        };
    }

    private function transactionMessage(WalletTransaction $transaction): string
    {
        $direction = $transaction->direction === WalletTransactionDirection::Deposit ? 'واریز' : 'برداشت';

        return "{$direction} {$this->money($transaction->amount)} تومان بابت {$transaction->typeLabel()} ثبت شد.";
    }

    private function directionLabel(mixed $direction): string
    {
        return $direction instanceof WalletTransactionDirection
            ? $direction->label()
            : WalletTransactionDirection::tryFrom((string) $direction)?->label() ?? 'تراکنش';
    }

    private function money(int $amount): string
    {
        return number_format($amount);
    }
}
