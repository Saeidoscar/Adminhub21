<?php

namespace Database\Seeders;

use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Contract;
use App\Models\PaymentGateway;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Models\Wallet;
use App\Models\WalletTransaction;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * The dataset a new instance needs to be explorable.
 *
 * Everything here is idempotent, so `php artisan db:seed` can run on every
 * container boot: a demo visitor sees balances, a contract and a support thread
 * instead of a set of empty states.
 */
class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $demo = $this->user('کاربر نمونه', 'demo@adminhub21.test', 'employer');
        $expert = $this->user('کارشناس قرارداد', 'expert@adminhub21.test', 'employer');

        $this->wallet($demo);

        $this->gateways();
        $this->contract($demo, $expert);
        $this->ticket($demo, $expert);
    }

    private function user(string $name, string $email, string $role): User
    {
        return User::query()->updateOrCreate(
            ['email' => $email],
            [
                'name' => $name,
                'phone' => '+98912' . str_pad((string) abs(crc32($email) % 10000000), 7, '0', STR_PAD_LEFT),
                'password' => Hash::make('password'),
                'role' => $role,
                'is_verified' => true,
            ],
        );
    }

    private function wallet(User $user): void
    {
        Wallet::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'balance' => 5_750_000,
                'withdrawable_balance' => 4_550_000,
                'blocked_balance' => 1_200_000,
            ],
        );

        $this->transaction($user, 'online_charge', 'deposit', 5_000_000, 'completed', [
            'gateway' => 'zibal',
        ]);
        $this->transaction($user, 'withdrawal', 'withdrawal', 450_000, 'pending');
        $this->transaction($user, 'contract_payment', 'withdrawal', 1_200_000, 'completed', [
            'reason' => 'blocked_for_contract',
        ]);
    }

    private function transaction(
        User $user,
        string $type,
        string $direction,
        int $amount,
        string $status,
        array $payload = [],
    ): void {
        WalletTransaction::query()->firstOrCreate(
            [
                'user_id' => $user->id,
                'type' => $type,
                'amount' => $amount,
            ],
            [
                'direction' => $direction,
                'status' => $status,
                'payload' => $payload,
            ],
        );
    }

    private function gateways(): void
    {
        PaymentGateway::query()->updateOrCreate(
            ['code' => 'zibal'],
            ['name' => 'زیبال', 'provider' => 'zibal', 'config' => [], 'is_active' => true],
        );
        PaymentGateway::query()->updateOrCreate(
            ['code' => 'sep'],
            ['name' => 'سامان', 'provider' => 'sep', 'config' => [], 'is_active' => true],
        );
    }

    private function contract(User $client, User $provider): void
    {
        Contract::query()->updateOrCreate(
            ['client_id' => $client->id, 'title' => 'قرارداد مشاوره حقوقی'],
            [
                'user_id' => $provider->id,
                'description' => 'بازبینی قرارداد و تهیه پیوست الحاقی.',
                'amount' => 12_000_000,
                'currency' => 'IRR',
                'status' => 'active',
                'starts_at' => now()->subDays(5),
                'ends_at' => now()->addDays(25),
            ],
        );

        Contract::query()->updateOrCreate(
            ['client_id' => $client->id, 'title' => 'قرارداد همکاری پروژه'],
            [
                'user_id' => $provider->id,
                'description' => 'طراحی و پیاده‌سازی نسخه اول وب‌سایت.',
                'amount' => 48_000_000,
                'currency' => 'IRR',
                'status' => 'draft',
            ],
        );
    }

    private function ticket(User $requester, User $agent): void
    {
        $ticket = Ticket::query()->updateOrCreate(
            ['user_id' => $requester->id, 'subject' => 'خطا در بارگذاری فایل قرارداد'],
            [
                'assigned_to' => $agent->id,
                'description' => 'هنگام بارگذاری PDF خطای ۵۰۰ دریافت می‌کنم.',
                'priority' => TicketPriority::High->value,
                'status' => TicketStatus::InProgress->value,
                'last_message_at' => now()->subHour(),
            ],
        );

        $messages = [
            [$requester, 'هنگام بارگذاری PDF خطای ۵۰۰ دریافت می‌کنم.'],
            [$agent, 'بررسی شد؛ محدودیت حجم فایل را افزایش دادیم، دوباره تست کنید.'],
        ];

        foreach ($messages as [$author, $body]) {
            TicketMessage::query()->firstOrCreate(
                ['ticket_id' => $ticket->id, 'body' => $body],
                ['user_id' => $author->id, 'is_internal' => false],
            );
        }

        Ticket::query()->updateOrCreate(
            ['user_id' => $requester->id, 'subject' => 'درخواست صدور فاکتور رسمی'],
            [
                'description' => 'برای پرداخت شارژ کیف پول فاکتور رسمی لازم دارم.',
                'priority' => TicketPriority::Medium->value,
                'status' => TicketStatus::Open->value,
            ],
        );
    }
}
