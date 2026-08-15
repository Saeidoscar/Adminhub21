<?php

namespace App\Services\Admin;

use App\Models\Contract;
use App\Models\ExternalServiceRequest;
use App\Models\Order;
use App\Models\PhoneConsultation;
use App\Models\ServiceRequest;
use App\Models\Ticket;
use App\Models\VendorApplication;

class AdminOperationService
{
    public function __construct(
        private readonly AdminDashboardService $dashboardService,
    ) {}

    public function overview(): array
    {
        return [
            'counts' => $this->dashboardService->operationCounts(),
            'vendorApplications' => VendorApplication::query()
                ->with('user:id,first_name,last_name,mobile')
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (VendorApplication $item) => [
                    'id' => $item->id,
                    'user' => $item->user?->full_name ?: 'کاربر حذف‌شده',
                    'mobile' => $item->user?->mobile,
                    'targetRole' => $item->target_role->value,
                    'targetRoleLabel' => $item->target_role->label(),
                    'status' => $item->status->value,
                    'price' => (int) $item->price,
                    'createdAt' => $item->created_at?->toISOString(),
                ]),
            'tickets' => Ticket::query()
                ->with('sender:id,first_name,last_name,mobile')
                ->latest('updated_at')
                ->limit(8)
                ->get()
                ->map(fn (Ticket $item) => [
                    'uuid' => $item->uuid,
                    'title' => $item->title,
                    'sender' => $item->sender?->full_name ?: 'کاربر حذف‌شده',
                    'mobile' => $item->sender?->mobile,
                    'status' => $item->status->value,
                    'updatedAt' => $item->updated_at?->toISOString(),
                ]),
            'contracts' => Contract::query()
                ->with('creator:id,first_name,last_name,mobile')
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (Contract $item) => [
                    'uuid' => $item->uuid,
                    'title' => $item->title,
                    'creator' => $item->creator?->full_name ?: 'کاربر حذف‌شده',
                    'status' => $item->status,
                    'createdAt' => $item->created_at?->toISOString(),
                ]),
            'orders' => Order::query()
                ->with('buyer:id,first_name,last_name,mobile')
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (Order $item) => [
                    'id' => $item->id,
                    'buyer' => $item->buyer?->full_name ?: 'کاربر حذف‌شده',
                    'mobile' => $item->buyer?->mobile,
                    'totalPrice' => (int) $item->total_price,
                    'status' => $item->status->value,
                    'createdAt' => $item->created_at?->toISOString(),
                ]),
            'serviceRequests' => ServiceRequest::query()
                ->with('requester:id,first_name,last_name,mobile')
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (ServiceRequest $item) => [
                    'uuid' => $item->uuid,
                    'title' => $item->title,
                    'requester' => $item->requester?->full_name ?: 'کاربر حذف‌شده',
                    'type' => $item->type->value,
                    'status' => $item->status->value,
                    'statusLabel' => $item->status->label(),
                    'createdAt' => $item->created_at?->toISOString(),
                ]),
            'consultations' => PhoneConsultation::query()
                ->with([
                    'user:id,first_name,last_name,mobile',
                    'vendor:id,first_name,last_name,mobile',
                ])
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (PhoneConsultation $item) => [
                    'id' => $item->id,
                    'user' => $item->user?->full_name ?: 'کاربر حذف‌شده',
                    'vendor' => $item->vendor?->full_name,
                    'minutes' => $item->minutes,
                    'price' => (int) $item->price,
                    'status' => $item->status->value,
                    'createdAt' => $item->created_at?->toISOString(),
                ]),
            'externalServices' => ExternalServiceRequest::query()
                ->with('user:id,first_name,last_name,mobile')
                ->latest('id')
                ->limit(8)
                ->get()
                ->map(fn (ExternalServiceRequest $item) => [
                    'uuid' => $item->uuid,
                    'user' => $item->user?->full_name,
                    'provider' => $item->provider,
                    'service' => $item->service,
                    'status' => $item->status,
                    'durationMs' => $item->duration_ms,
                    'billable' => $item->billable,
                    'billedAmount' => $item->billed_amount,
                    'createdAt' => $item->created_at?->toISOString(),
                ]),
        ];
    }
}
