<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

class MigrateLegacyData extends Command
{
    protected $signature = 'dadline:migrate
                            {--dry-run : فقط نمایش بده چه تغییری اعمال می‌شود، بدون نوشتن واقعی}
                            {--only= : فقط یک بخش را اجرا کن}
                            {--part= : فقط یک پارت را اجرا کن (1|2|3|4|5|6|7|8|9)}';

    protected $description = 'Migrate selected data from the legacy database';

    /**
     * @return array<string, array{part: string, method: string, sequence: string|list<string>|null}>
     */
    public static function migrations(): array
    {
        return [
            'users' => ['part' => '1', 'method' => 'migrateUsers', 'sequence' => 'users'],
            'cities' => ['part' => '1', 'method' => 'migrateCities', 'sequence' => 'cities'],
            'files' => ['part' => '1', 'method' => 'migrateAttachments', 'sequence' => 'attachments'],
            'names' => ['part' => '1', 'method' => 'migrateNamesFromUserMeta', 'sequence' => null],
            'profile' => ['part' => '1', 'method' => 'migrateProfileFromDadUserMeta', 'sequence' => null],
            'avatars' => ['part' => '1', 'method' => 'migrateAvatars', 'sequence' => null],
            'legalcategory' => ['part' => '1', 'method' => 'migrateExpertiseFromUserMeta', 'sequence' => null],
            'short-links' => ['part' => '1', 'method' => 'migrateShortLinks', 'sequence' => 'short_links'],
            'notification-preferences' => ['part' => '1', 'method' => 'migrateNotificationPreferences', 'sequence' => null],
            'bot-links' => ['part' => '1', 'method' => 'migrateBotLinks', 'sequence' => null],
            'user-subscriptions' => ['part' => '1', 'method' => 'migrateUserSubscriptions', 'sequence' => null],
            'platform-alerts' => ['part' => '1', 'method' => 'migratePlatformAlerts', 'sequence' => 'platform_alerts'],
            'notifications' => ['part' => '1', 'method' => 'migrateNotifications', 'sequence' => 'notifications'],
            'tickets' => ['part' => '1', 'method' => 'migrateTickets', 'sequence' => 'tickets'],
            'ticket-messages' => ['part' => '1', 'method' => 'migrateTicketMessages', 'sequence' => 'ticket_messages'],
            'gift-cards' => ['part' => '1', 'method' => 'migrateGiftCards', 'sequence' => 'gift_cards'],
            'gift-card-redemptions' => ['part' => '1', 'method' => 'migrateGiftCardRedemptions', 'sequence' => null],
            'vendor-profile' => ['part' => '2', 'method' => 'migrateVendorProfile', 'sequence' => null],
            'vendor-services' => ['part' => '2', 'method' => 'migrateVendorServices', 'sequence' => 'vendor_services'],
            'vendor-applications' => ['part' => '2', 'method' => 'migrateVendorApplications', 'sequence' => 'vendor_applications'],
            'consultation-subscriptions' => ['part' => '2', 'method' => 'migrateConsultationSubscriptions', 'sequence' => 'consultation_subscriptions'],
            'phone-consultations' => ['part' => '2', 'method' => 'migratePhoneConsultations', 'sequence' => 'phone_consultations'],
            'reviews' => ['part' => '3', 'method' => 'migrateReviews', 'sequence' => 'reviews'],
            'questions' => ['part' => '3', 'method' => 'migrateQuestions', 'sequence' => 'questions'],
            'question-answers' => ['part' => '3', 'method' => 'migrateQuestionAnswers', 'sequence' => 'answers_question'],
            'law-categories' => ['part' => '3', 'method' => 'migrateLawCategories', 'sequence' => 'law_categories'],
            'law-titles' => ['part' => '3', 'method' => 'migrateLawTitles', 'sequence' => 'law_titles'],
            'law-sections' => ['part' => '3', 'method' => 'migrateLawSections', 'sequence' => 'law_sections'],
            'law-articles' => ['part' => '3', 'method' => 'migrateLawArticles', 'sequence' => 'law_articles'],
            'terminology' => ['part' => '3', 'method' => 'migrateTerminology', 'sequence' => 'terminology'],
            'blogs' => ['part' => '3', 'method' => 'migrateBlogs', 'sequence' => 'blogs'],
            'stories' => ['part' => '3', 'method' => 'migrateStories', 'sequence' => 'stories'],
            'story-comments' => ['part' => '3', 'method' => 'migrateStoryComments', 'sequence' => 'comments'],
            'products' => ['part' => '4', 'method' => 'migrateProducts', 'sequence' => 'products'],
            'product-orders' => [
                'part' => '4',
                'method' => 'migrateProductOrders',
                'sequence' => ['orders', 'order_items'],
            ],
            'wallets' => ['part' => '5', 'method' => 'migrateWallets', 'sequence' => null],
            'wallet-transactions' => ['part' => '5', 'method' => 'migrateWalletTransactions', 'sequence' => 'wallet_transactions'],
            'wallet-payments' => ['part' => '5', 'method' => 'migrateWalletPayments', 'sequence' => 'wallet_transaction_payments'],
            'payout-settlements' => ['part' => '5', 'method' => 'migratePayoutSettlements', 'sequence' => 'payout_settlements'],
            'financials' => ['part' => '5', 'method' => 'migrateFinancials', 'sequence' => null],
            'affiliates' => ['part' => '5', 'method' => 'migrateAffiliates', 'sequence' => 'affiliates'],
            'affiliate-commissions' => ['part' => '5', 'method' => 'migrateAffiliateCommissions', 'sequence' => 'affiliate_commissions'],
            'contracts' => ['part' => '6', 'method' => 'migrateContracts', 'sequence' => 'contracts'],
            'contract-attachments' => ['part' => '6', 'method' => 'migrateContractAttachments', 'sequence' => 'contract_attachments'],
            'signatures' => ['part' => '6', 'method' => 'migrateSignatures', 'sequence' => 'signatures'],
            'contract-ai-analyses' => ['part' => '6', 'method' => 'migrateContractAiAnalyses', 'sequence' => 'contract_ai_analyses'],
            'office-core' => [
                'part' => '7',
                'method' => 'migrateOfficeCore',
                'sequence' => [
                    'offices',
                    'office_members',
                    'office_claim_types',
                    'office_request_types',
                    'office_referral_authorities',
                    'office_contacts',
                    'office_cases',
                    'office_case_parties',
                ],
            ],
            'office-workflow' => [
                'part' => '7',
                'method' => 'migrateOfficeWorkflow',
                'sequence' => [
                    'office_case_notes',
                    'office_case_actions',
                    'office_time_logs',
                    'office_case_tasks',
                    'office_case_events',
                    'office_case_ai',
                ],
            ],
            'office-financial-attachments' => [
                'part' => '7',
                'method' => 'migrateOfficeFinancialAndAttachments',
                'sequence' => [
                    'office_transactions',
                    'office_attachments',
                ],
            ],
            'service-marketplace' => [
                'part' => '8',
                'method' => 'migrateServiceMarketplace',
                'sequence' => [
                    'service_requests',
                    'service_offers',
                    'service_results',
                    'service_attachments',
                    'conversations',
                    'messages',
                    'message_attachments',
                ],
            ],
            'dodbot-ai' => [
                'part' => '9',
                'method' => 'migrateDodbotAi',
                'sequence' => [
                    'dodbot_conversations',
                    'dodbot_messages',
                    'dodbot_purchases',
                ],
            ],
        ];
    }

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $only = $this->option('only');
        $part = $this->option('part');

        if ($part !== null && ! in_array($part, ['1', '2', '3', '4', '5', '6', '7', '8', '9'], true)) {
            $this->error('Invalid --part. Allowed values: 1, 2, 3, 4, 5, 6, 7, 8, 9.');

            return self::INVALID;
        }

        $migrations = self::migrations();

        if ($only !== null && ! isset($migrations[$only])) {
            $this->error('Invalid --only. Allowed values: '.implode(', ', array_keys($migrations)).'.');

            return self::INVALID;
        }

        if ($only !== null && $part !== null && $migrations[$only]['part'] !== $part) {
            $this->error("Migration '{$only}' does not belong to part {$part}.");

            return self::INVALID;
        }

        $selected = array_filter(
            $migrations,
            fn (array $migration, string $name): bool => ($only === null || $only === $name)
                && ($part === null || $part === $migration['part']),
            ARRAY_FILTER_USE_BOTH
        );

        $parts = [];

        foreach ($selected as $migration) {
            $partInstance = $parts[$migration['part']] ??= $this->makePart($migration['part']);
            $partInstance->{$migration['method']}($dryRun);

            if (! $dryRun) {
                foreach ((array) $migration['sequence'] as $sequence) {
                    MigrateHelper::resetSequence($sequence);
                }
            }
        }

        $this->info($dryRun ? 'Dry run completed successfully.' : 'Migration completed successfully.');

        return self::SUCCESS;
    }

    private function makePart(string $part): MigratePart1|MigratePart2|MigratePart3|MigratePart4|MigratePart5|MigratePart6|MigratePart7|MigratePart8|MigratePart9
    {
        return match ($part) {
            '1' => new MigratePart1($this),
            '2' => new MigratePart2($this),
            '3' => new MigratePart3($this),
            '4' => new MigratePart4($this),
            '5' => new MigratePart5($this),
            '6' => new MigratePart6($this),
            '7' => new MigratePart7($this),
            '8' => new MigratePart8($this),
            '9' => new MigratePart9($this),
        };
    }
}
