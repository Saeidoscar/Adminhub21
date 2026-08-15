<?php

namespace Tests\Unit;

use App\Console\Commands\MigrateHelper;
use App\Console\Commands\MigrateLegacyData;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use InvalidArgumentException;
use Tests\TestCase;

class MigrateLegacyDataTest extends TestCase
{
    public function test_migration_catalog_assigns_every_task_to_a_supported_part(): void
    {
        $migrations = MigrateLegacyData::migrations();

        $this->assertSame('1', $migrations['users']['part']);
        $this->assertSame('attachments', $migrations['files']['sequence']);
        $this->assertSame('2', $migrations['vendor-profile']['part']);
        $this->assertSame('migrateShortLinks', $migrations['short-links']['method']);
        $this->assertSame('short_links', $migrations['short-links']['sequence']);
        $this->assertSame('migrateVendorServices', $migrations['vendor-services']['method']);
        $this->assertSame('3', $migrations['reviews']['part']);
        $this->assertSame('reviews', $migrations['reviews']['sequence']);
        $this->assertSame('migrateBlogs', $migrations['blogs']['method']);
        $this->assertSame('stories', $migrations['stories']['sequence']);
        $this->assertSame('migrateStoryComments', $migrations['story-comments']['method']);
        $this->assertSame('comments', $migrations['story-comments']['sequence']);
        $this->assertSame('4', $migrations['products']['part']);
        $this->assertSame('migrateProducts', $migrations['products']['method']);
        $this->assertSame(['orders', 'order_items'], $migrations['product-orders']['sequence']);
        $this->assertSame('9', $migrations['dodbot-ai']['part']);
        $this->assertSame('migrateDodbotAi', $migrations['dodbot-ai']['method']);
        $this->assertSame([
            'dodbot_conversations',
            'dodbot_messages',
            'dodbot_purchases',
        ], $migrations['dodbot-ai']['sequence']);

        foreach ($migrations as $migration) {
            $this->assertContains($migration['part'], ['1', '2', '3', '4', '5', '6', '7', '8', '9']);
        }
    }

    public function test_command_rejects_an_unknown_part_before_connecting_to_legacy_database(): void
    {
        $this->artisan('dadline:migrate', ['--part' => '10'])
            ->expectsOutput('Invalid --part. Allowed values: 1, 2, 3, 4, 5, 6, 7, 8, 9.')
            ->assertExitCode(2);
    }

    public function test_command_rejects_an_unknown_migration_before_connecting_to_legacy_database(): void
    {
        $this->artisan('dadline:migrate', ['--only' => 'unknown'])
            ->expectsOutputToContain('Invalid --only.')
            ->assertExitCode(2);
    }

    public function test_command_rejects_a_migration_from_another_part(): void
    {
        $this->artisan('dadline:migrate', [
            '--part' => '1',
            '--only' => 'vendor-services',
        ])
            ->expectsOutput("Migration 'vendor-services' does not belong to part 1.")
            ->assertExitCode(2);
    }

    public function test_short_links_migration_preserves_legacy_data_and_is_idempotent(): void
    {
        config([
            'database.connections.legacy' => [
                'driver' => 'sqlite',
                'database' => ':memory:',
                'prefix' => '',
            ],
        ]);
        DB::purge('legacy');

        Schema::create('short_links', function (Blueprint $table): void {
            $table->id();
            $table->string('short_code', 10)->unique();
            $table->text('original_url')->unique();
            $table->unsignedBigInteger('clicks')->default(0);
            $table->timestampTz('created_at')->useCurrent();
        });
        Schema::connection('legacy')->create('ad_dad_shorten_link', function (Blueprint $table): void {
            $table->id();
            $table->string('short_code', 10)->unique();
            $table->text('original_url');
            $table->unsignedBigInteger('clicks')->nullable();
            $table->timestamp('created_at');
        });

        DB::table('short_links')->insert([
            'id' => 10,
            'short_code' => 'Ab12Cd',
            'original_url' => 'https://dadline.net/lawyer/example',
            'clicks' => 4,
            'created_at' => '2025-03-06 12:02:02',
        ]);

        DB::connection('legacy')->table('ad_dad_shorten_link')->insert([
            [
                'id' => 10,
                'short_code' => 'Ab12Cd',
                'original_url' => 'https://dadline.net/lawyer/example',
                'clicks' => 4,
                'created_at' => '2025-03-06 12:02:02',
            ],
            [
                'id' => 11,
                'short_code' => 'Ef34Gh',
                'original_url' => 'https://dadline.net/question/%d8%a8%d8%af%d9%87%db%8c?source=legacy',
                'clicks' => null,
                'created_at' => '2025-03-07 12:02:02',
            ],
        ]);

        $this->artisan('dadline:migrate', ['--only' => 'short-links'])
            ->assertSuccessful();
        $this->artisan('dadline:migrate', ['--only' => 'short-links'])
            ->assertSuccessful();

        $this->assertDatabaseCount('short_links', 2);
        $this->assertDatabaseHas('short_links', [
            'id' => 10,
            'short_code' => 'Ab12Cd',
            'original_url' => '/lawyer/example',
            'clicks' => 4,
        ]);
        $this->assertDatabaseHas('short_links', [
            'id' => 11,
            'short_code' => 'Ef34Gh',
            'original_url' => '/question/%d8%a8%d8%af%d9%87%db%8c?source=legacy',
            'clicks' => 0,
        ]);
    }

    public function test_users_migration_preserves_legacy_password_hash_without_rehashing(): void
    {
        config([
            'database.connections.legacy' => [
                'driver' => 'sqlite',
                'database' => ':memory:',
                'prefix' => '',
            ],
        ]);
        DB::purge('legacy');

        Schema::create('users', function (Blueprint $table): void {
            $table->id();
            $table->string('mobile', 11)->unique();
            $table->string('password')->nullable();
            $table->timestamp('registered_at')->nullable();
            $table->timestamps();
        });

        Schema::connection('legacy')->create('ad_users', function (Blueprint $table): void {
            $table->unsignedBigInteger('ID')->primary();
            $table->string('user_login');
            $table->string('user_pass')->nullable();
            $table->timestamp('user_registered')->nullable();
        });

        DB::connection('legacy')->table('ad_users')->insert([
            'ID' => 123,
            'user_login' => '09123456789',
            'user_pass' => '$wp$2y$10$abcdefghijklmnopqrstuvwxyzABCDEFGHijklmno.12345678901',
            'user_registered' => '2025-03-06 12:02:02',
        ]);

        $this->artisan('dadline:migrate', ['--only' => 'users'])
            ->assertSuccessful();

        $this->assertSame(
            '$wp$2y$10$abcdefghijklmnopqrstuvwxyzABCDEFGHijklmno.12345678901',
            DB::table('users')->where('id', 123)->value('password')
        );
    }

    public function test_reset_sequence_rejects_unsafe_table_names_before_querying_database(): void
    {
        $this->expectException(InvalidArgumentException::class);

        MigrateHelper::resetSequence('users; DROP TABLE users');
    }
}
