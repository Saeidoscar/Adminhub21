<?php

namespace App\Http\Controllers\Api\V1;

use App\Services\Notifications\NotificationService;
use App\Actions\Wallet\ApproveWithdrawalAction;
use App\Actions\Wallet\RejectWithdrawalAction;
use App\Enums\NotificationCategory;
use App\Models\User;
use App\Models\Affiliate;
use App\Models\AffiliateCommission;
use App\Models\Option;
use App\Models\WalletTransaction;
use App\Models\Contract;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        private readonly NotificationService $notificationService,
        private readonly ApproveWithdrawalAction $approveWithdrawal,
        private readonly RejectWithdrawalAction $rejectWithdrawal,
    ) {}

    public function dashboard(Request $request): JsonResponse
    {
        return response()->json([
            'users' => User::query()->count(),
            'packages' => \App\Models\Package::query()->count(),
            'contracts' => Contract::query()->count(),
            'reviews' => \App\Models\Review::query()->count(),
            'tickets' => \App\Models\Ticket::query()->count(),
        ]);
    }

    public function dashboardStats(Request $request): JsonResponse
    {
        return response()->json(['stats' => [
            'totalUsers' => User::query()->count(),
            'totalAdmins' => User::query()->whereIn('role', ['admin', 'super_admin'])->count(),
            'totalEmployers' => User::query()->where('role', 'employer')->count(),
            'totalContracts' => Contract::query()->count(),
            'activeContracts' => Contract::query()->where('status', 'active')->count(),
            'totalRevenueToman' => (float) WalletTransaction::query()->where('direction', 'deposit')->where('status', 'completed')->sum('amount'),
            'totalRevenueUSD' => 0,
            'totalPackages' => \App\Models\Package::query()->count(),
            'totalReviews' => \App\Models\Review::query()->count(),
            'avgRating' => (float) \App\Models\Review::query()->avg('rating') ?? 0,
        ]]);
    }

    public function users(Request $request): JsonResponse
    {
        $this->authorize('viewAny', User::class);

        $query = User::query();

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($role = $request->string('role')->toString()) {
            $query->where('role', $role);
        }

        $users = $query->paginate();

        return response()->json(['users' => $users->items()], 200, ['X-Total-Count' => $users->total()]);
    }

    public function showUser($id): JsonResponse
    {
        $user = User::query()->findOrFail($id);
        $this->authorize('view', $user);

        return response()->json(['user' => $user]);
    }

    public function updateUser($id, Request $request): JsonResponse
    {
        $user = User::query()->findOrFail($id);
        $this->authorize('update', $user);

        $validated = $request->validate([
            'role' => ['nullable', 'string', 'in:employer,admin,super_admin'],
            'nameEn' => ['nullable', 'string', 'max:255'],
            'nameFa' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:255'],
            'phoneVerified' => ['nullable', 'boolean'],
        ]);

        $data = [];
        if (isset($validated['role'])) {
            $data['role'] = $validated['role'];
        }
        if (isset($validated['nameEn'])) {
            $data['name'] = $validated['nameEn'];
        }
        if (isset($validated['phone'])) {
            $data['phone'] = $validated['phone'];
        }
        if (isset($validated['phoneVerified'])) {
            $data['is_verified'] = (bool) $validated['phoneVerified'];
        }

        $user->update($data);

        return response()->json(['user' => $user]);
    }

    public function deleteUser($id): JsonResponse
    {
        $user = User::query()->findOrFail($id);
        $this->authorize('delete', $user);
        $user->update(['is_banned' => true]);

        return response()->json(null, 204);
    }

    public function contracts(Request $request): JsonResponse
    {
        $this->authorize('viewAny', Contract::class);

        $query = Contract::query()->with(['user', 'client', 'package']);

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        $contracts = $query->paginate();

        return response()->json(['contracts' => $contracts->items()], 200, ['X-Total-Count' => $contracts->total()]);
    }

    public function showContract($id): JsonResponse
    {
        $contract = Contract::query()->with(['user', 'client', 'package'])->findOrFail($id);
        $this->authorize('view', $contract);

        return response()->json(['contract' => $contract]);
    }

    public function updateContract($id, Request $request): JsonResponse
    {
        $contract = Contract::query()->findOrFail($id);
        $this->authorize('update', $contract);

        $validated = $request->validate([
            'status' => ['nullable', 'string', 'in:draft,pending,active,completed,cancelled'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'amount' => ['nullable', 'numeric', 'min:0'],
            'currency' => ['nullable', 'string', 'max:10'],
        ]);

        $contract->update($validated);

        return response()->json(['contract' => $contract]);
    }

    public function reports(Request $request): JsonResponse
    {
        return response()->json(['message' => 'Reports endpoint']);
    }

    public function profiles(Request $request): JsonResponse
    {
        $profiles = \App\Models\AdminProfile::query()->with('user')->paginate();

        return response()->json(['profiles' => $profiles->items()], 200, ['X-Total-Count' => $profiles->total()]);
    }

    public function showProfile($id): JsonResponse
    {
        $profile = \App\Models\AdminProfile::query()->with('user')->findOrFail($id);

        return response()->json(['profile' => $profile]);
    }

    public function updateMyProfile(Request $request): JsonResponse
    {
        $profile = \App\Models\AdminProfile::query()->where('user_id', $request->user()->id)->firstOrFail();

        $validated = $request->validate([
            'photo' => ['nullable', 'string'],
            'bioEn' => ['nullable', 'string'],
            'bioFa' => ['nullable', 'string'],
            'skillsEn' => ['nullable', 'array'],
            'skillsFa' => ['nullable', 'array'],
            'platforms' => ['nullable', 'array'],
            'monthlyToman' => ['nullable', 'numeric', 'min:0'],
            'monthlyUSD' => ['nullable', 'numeric', 'min:0'],
        ]);

        $data = [];
        if (isset($validated['bioEn'])) {
            $data['bio'] = $validated['bioEn'];
        }
        if (isset($validated['skillsEn'])) {
            $data['skills'] = $validated['skillsEn'];
        }
        if (isset($validated['platforms'])) {
            $data['platforms'] = $validated['platforms'];
        }
        if (isset($validated['monthlyToman']) || isset($validated['monthlyUSD'])) {
            $data['hourly_rate'] = $validated['monthlyToman'] ?? $validated['monthlyUSD'] ?? $profile->hourly_rate;
        }

        $profile->update($data);

        return response()->json(['profile' => $profile]);
    }

    public function settings(Request $request): JsonResponse
    {
        $settings = Option::query()->get();

        return response()->json($settings);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => ['required', 'array'],
        ]);

        foreach ($request->settings as $key => $value) {
            Option::query()->updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => 'admin']
            );
        }

        return response()->json(['message' => 'Settings updated']);
    }

    public function sendNotification(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'title' => ['required', 'string', 'max:255'],
            'body' => ['required', 'string'],
            'category' => ['nullable', 'string'],
        ]);

        $user = User::query()->findOrFail($request->user_id);
        $category = NotificationCategory::tryFrom($request->category ?? 'system') ?? NotificationCategory::System;

        $notification = $this->notificationService->send($user, $category, $request->title, $request->body);

        return response()->json($notification, 201);
    }

    public function pendingWithdrawals(Request $request): JsonResponse
    {
        $transactions = WalletTransaction::query()
            ->where('direction', 'withdrawal')
            ->where('status', 'pending')
            ->with('user')
            ->latest()
            ->paginate();

        return response()->json($transactions);
    }

    public function approveWithdrawal($id): JsonResponse
    {
        $transaction = WalletTransaction::query()->findOrFail($id);
        $transaction = $this->approveWithdrawal->execute($transaction);

        return response()->json($transaction);
    }

    public function rejectWithdrawal($id): JsonResponse
    {
        $transaction = WalletTransaction::query()->findOrFail($id);
        $transaction = $this->rejectWithdrawal->execute($transaction);

        return response()->json($transaction);
    }

    public function affiliates(Request $request): JsonResponse
    {
        $affiliates = Affiliate::query()
            ->with('user')
            ->paginate();

        return response()->json(['affiliates' => $affiliates->items()], 200, ['X-Total-Count' => $affiliates->total()]);
    }

    public function showAffiliate($id): JsonResponse
    {
        $affiliate = Affiliate::query()->with('user')->findOrFail($id);

        return response()->json(['affiliate' => $affiliate]);
    }

    public function affiliateCommissions($id): JsonResponse
    {
        $affiliate = Affiliate::query()->findOrFail($id);

        $commissions = $affiliate->commissions()
            ->with(['sourceTransaction.user', 'commissionTransaction'])
            ->paginate();

        return response()->json(['commissions' => $commissions->items()], 200, ['X-Total-Count' => $commissions->total()]);
    }
}
