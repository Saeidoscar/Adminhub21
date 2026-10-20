<?php

namespace Database\Seeders;

use App\Actions\Contracts\GenerateContractPdfAction;
use App\Enums\ContentStatus;
use App\Enums\TicketPriority;
use App\Enums\TicketStatus;
use App\Models\Contract;
use App\Models\Package;
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
        $this->marketplace($demo, $expert);
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

    /**
     * Published listings for the public catalogue.
     *
     * Without these the marketplace would only show empty states on a fresh
     * database; the catalogue is the first thing a visitor opens.
     */
    private function marketplace(User $demo, User $expert): void
    {
        $listings = [
            [
                'slug' => 'instagram-growth-basic',
                'user_id' => $demo->id,
                'title' => 'رشد اینستاگرام — پایه',
                'description' => 'پست روزانه، مدیریت استوری و پاسخ به مخاطبان برای برندهای در حال رشد؛ مناسب یک خط محصول.',
                'price' => 15_000_000,
                'features' => ['۱۲ پست در ماه', 'مدیریت روزانه‌ی استوری', 'پاسخ به دایرکت و کامنت', 'گزارش ماهانه'],
                'views' => 1240,
                'sales' => 18,
                'platforms' => ['instagram' => ['posts_per_month' => 12, 'stories_per_month' => 30, 'comments_per_month' => 200]],
            ],
            [
                'slug' => 'instagram-studio',
                'user_id' => $demo->id,
                'title' => 'استودیوی حرفه‌ای اینستاگرام',
                'description' => 'تولید محتوای ریلزمحور با کارگردانی هنری، عکاسی ماهانه و تقویم محتوای فروش‌محور.',
                'price' => 28_000_000,
                'features' => ['۳۰ پست در ماه', '۱۶ ریلز', 'عکاسی محصول', 'تقویم محتوای فروش‌محور'],
                'views' => 2310,
                'sales' => 34,
                'platforms' => ['instagram' => ['posts_per_month' => 30, 'stories_per_month' => 60, 'reels_per_month' => 16]],
            ],
            [
                'slug' => 'social-media-complete',
                'user_id' => $demo->id,
                'title' => 'بسته‌ی کامل شبکه‌های اجتماعی',
                'description' => 'مدیریت اینستاگرام و تلگرام با کمپین چندکاناله، گزارش هفتگی و پشتیبانی با اولویت بالا.',
                'price' => 42_000_000,
                'features' => ['اینستاگرام + تلگرام', 'گزارش هفتگی', 'پشتیبانی با اولویت بالا'],
                'views' => 1870,
                'sales' => 21,
                'platforms' => [
                    'instagram' => ['posts_per_month' => 24, 'reels_per_month' => 8],
                    'telegram' => ['posts_per_month' => 30],
                ],
            ],
            [
                'slug' => 'campaign-sprint',
                'user_id' => $demo->id,
                'title' => 'اسپرینت کمپین (۲ هفته)',
                'description' => 'کمپین آماده‌ی پرتاب: کارگردانی خلاق، ۶ ریلز، ۱۲ استوری و راه‌اندازی تبلیغات پرداختی.',
                'price' => 45_000_000,
                'features' => ['۶ ریلز', '۱۲ استوری', 'راه‌اندازی تبلیغات', 'تحویل ۳ روزه'],
                'views' => 960,
                'sales' => 9,
                'platforms' => ['instagram' => ['posts_per_month' => 6, 'stories_per_month' => 12, 'reels_per_month' => 6]],
            ],
            [
                'slug' => 'contract-review',
                'user_id' => $expert->id,
                'title' => 'بازبینی و تنظیم قرارداد',
                'description' => 'بررسی حقوقی قرارداد همکاری، پیشنهاد اصلاحات و تهیه‌ی پیوست الحاقی در ۴۸ ساعت.',
                'price' => 6_500_000,
                'features' => ['بازبینی بندها', 'پیشنهاد اصلاحات', 'پیوست الحاقی'],
                'views' => 640,
                'sales' => 27,
                'platforms' => [],
            ],
            [
                'slug' => 'content-calendar',
                'user_id' => $expert->id,
                'title' => 'تقویم محتوای سه‌ماهه',
                'description' => 'برنامه‌ریزی محتوای سه ماه با موضوعات، قالب‌ها و زمان‌بندی انتشار برای یک برند.',
                'price' => 9_800_000,
                'features' => ['۳۶ ایده‌ی محتوا', 'تقویم انتشار', 'راهنمای لحن برند'],
                'views' => 780,
                'sales' => 14,
                'platforms' => [],
            ],
        ];

        foreach ($listings as $listing) {
            $platforms = $listing['platforms'];
            unset($listing['platforms']);

            $package = Package::query()->updateOrCreate(
                ['slug' => $listing['slug']],
                [
                    ...$listing,
                    'currency' => 'IRT',
                    'status' => ContentStatus::Published->value,
                    'media' => [],
                ],
            );

            foreach ($platforms as $platform => $counts) {
                $package->platformConfigs()->updateOrCreate(
                    ['platform' => $platform],
                    $counts,
                );
            }
        }
    }

    private function contract(User $client, User $provider): void
    {
        $active = Contract::query()->updateOrCreate(
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

        $this->contractPdf($active);
    }

    /**
     * The contract screen links to a PDF download; without a file the link only
     * says "not generated yet". Generating it through the same action the API
     * uses keeps the demo honest — and a rendering failure must never stop the
     * dataset from seeding.
     *
     * @return void
     */
    private function contractPdf(Contract $contract): void
    {
        if (filled($contract->pdf_path)) {
            return;
        }

        try {
            app(GenerateContractPdfAction::class)->execute($contract);
        } catch (\Throwable $error) {
            report($error);
        }
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
