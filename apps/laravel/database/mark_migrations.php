<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$migrations = [
    '2024_01_01_000001_create_api_tokens_table',
    '2024_01_01_000002_create_admin_profiles_table',
    '2024_01_01_000003_create_packages_table',
    '2024_01_01_000004_create_custom_offers_table',
    '2024_01_01_000005_create_contracts_table',
    '2024_01_01_000006_create_favorites_table',
    '2024_01_01_000007_create_reviews_table',
    '2024_01_01_000008_create_wallets_table',
    '2024_01_01_000009_create_wallet_transactions_table',
    '2024_01_01_000010_create_payouts_table',
    '2024_01_01_000011_create_cases_table',
    '2024_01_01_000012_create_tasks_table',
    '2024_01_01_000013_create_events_table',
    '2024_01_01_000014_create_time_logs_table',
    '2024_01_01_000015_create_portfolio_items_table',
    '2024_01_01_000016_create_tickets_table',
    '2024_01_01_000017_create_ticket_messages_table',
    '2024_01_01_000018_create_stories_table',
    '2024_01_01_000019_create_blogs_table',
    '2024_01_01_000020_create_comments_table',
    '2024_01_01_000021_create_ai_models_table',
    '2024_01_01_000022_create_ai_conversations_table',
    '2024_01_01_000023_create_ai_messages_table',
    '2024_01_01_000024_create_affiliate_codes_table',
    '2024_01_01_000025_create_affiliate_commissions_table',
    '2024_01_01_000026_create_tools_table',
    '2024_01_01_000027_create_editors_table',
    '2024_01_01_000028_create_vibe_coders_table',
];

foreach ($migrations as $m) {
    if (!Illuminate\Support\Facades\DB::table('migrations')->where('migration', $m)->exists()) {
        Illuminate\Support\Facades\DB::table('migrations')->insert([
            'id' => random_int(1, 999999999),
            'migration' => $m,
            'batch' => 1,
        ]);
    }
}

echo "Marked " . count($migrations) . " migrations as ran\n";
