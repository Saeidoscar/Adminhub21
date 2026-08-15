<?php

namespace App\Providers;

use App\Enums\NotificationChannel;
use App\Models\Contract;
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
use App\Observers\NotificationDomainObserver;
use App\Policies\ContractPolicy;
use App\Policies\TicketPolicy;
use App\Services\ExternalServices\ApiIr\ApiIrBankAccountVerificationProvider;
use App\Services\ExternalServices\ApiIr\ApiIrIdentityVerificationProvider;
use App\Services\ExternalServices\BankAccountVerificationManager;
use App\Services\ExternalServices\IdentityVerificationManager;
use App\Services\Notifications\Channels\BaleNotificationChannel;
use App\Services\Notifications\Channels\CallNotificationChannel;
use App\Services\Notifications\Channels\DatabaseNotificationChannel;
use App\Services\Notifications\Channels\EitaaNotificationChannel;
use App\Services\Notifications\Channels\LogNotificationChannel;
use App\Services\Notifications\Channels\SmsNotificationChannel;
use App\Services\Notifications\Channels\TelegramNotificationChannel;
use App\Services\Notifications\NotificationChannelManager;
use App\Services\Notifications\Providers\AdlySmsProvider;
use App\Services\Notifications\Providers\ApiIrCallOtpProvider;
use App\Services\Notifications\Providers\ApiIrSmsOtpProvider;
use App\Services\Notifications\Providers\LogCallProvider;
use App\Services\Notifications\Providers\LogSmsProvider;
use App\Services\Notifications\Providers\MeliPayamakPatternProvider;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(IdentityVerificationManager::class, function ($app): IdentityVerificationManager {
            return new IdentityVerificationManager([
                $app->make(ApiIrIdentityVerificationProvider::class),
            ]);
        });

        $this->app->singleton(BankAccountVerificationManager::class, function ($app): BankAccountVerificationManager {
            return new BankAccountVerificationManager([
                $app->make(ApiIrBankAccountVerificationProvider::class),
            ]);
        });

        $this->app->singleton(NotificationChannelManager::class, function ($app): NotificationChannelManager {
            $smsProviders = [
                $app->make(ApiIrSmsOtpProvider::class),
                $app->make(MeliPayamakPatternProvider::class),
                $app->make(AdlySmsProvider::class),
                new LogSmsProvider('sms_log'),
            ];
            $callProviders = [
                $app->make(ApiIrCallOtpProvider::class),
                new LogCallProvider,
            ];

            $drivers = [
                NotificationChannel::Database->value => new DatabaseNotificationChannel,
                NotificationChannel::Sms->value => new SmsNotificationChannel($smsProviders),
                NotificationChannel::Telegram->value => $app->make(TelegramNotificationChannel::class),
                NotificationChannel::Bale->value => $app->make(BaleNotificationChannel::class),
                NotificationChannel::Eitaa->value => $app->make(EitaaNotificationChannel::class),
                NotificationChannel::Push->value => new LogNotificationChannel(NotificationChannel::Push, 'fcm'),
                NotificationChannel::Email->value => new LogNotificationChannel(NotificationChannel::Email, 'mail'),
                NotificationChannel::Call->value => new CallNotificationChannel($callProviders),
            ];

            return new NotificationChannelManager($drivers);
        });
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Contract::class, ContractPolicy::class);
        Gate::policy(Ticket::class, TicketPolicy::class);

        WalletTransaction::observe(NotificationDomainObserver::class);
        PurchaseIntent::observe(NotificationDomainObserver::class);
        PayoutSettlement::observe(NotificationDomainObserver::class);
        ServiceRequest::observe(NotificationDomainObserver::class);
        ServiceOffer::observe(NotificationDomainObserver::class);
        ServiceResult::observe(NotificationDomainObserver::class);
        Ticket::observe(NotificationDomainObserver::class);
        TicketMessage::observe(NotificationDomainObserver::class);
        Review::observe(NotificationDomainObserver::class);
        QuestionAnswer::observe(NotificationDomainObserver::class);
        OfficeCaseTask::observe(NotificationDomainObserver::class);
        PhoneConsultation::observe(NotificationDomainObserver::class);

        RateLimiter::for('public-api', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip());
        });
    }
}
