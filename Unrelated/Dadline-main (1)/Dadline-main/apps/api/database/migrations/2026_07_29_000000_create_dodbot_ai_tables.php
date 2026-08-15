<?php

use App\Enums\DodbotConversationType;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dodbot_balances', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->primary()
                ->constrained()
                ->cascadeOnDelete();

            $table->unsignedBigInteger('balance')->default(0);
            $table->timestampTz('updated_at')->useCurrent();
        });

        Schema::create('dadbot_models', function (Blueprint $table) {
            $table->id();
            $table->string('provider', 50);
            $table->string('code', 100)->unique();
            $table->string('name', 100);
            $table->string('group', 20);
            $table->decimal('in_usd', 10, 4);
            $table->decimal('cache_usd', 10, 4)->nullable();
            $table->decimal('out_usd', 10, 4);
            $table->boolean('is_active')->default(true);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index(['provider', 'is_active']);
            $table->index(['group', 'is_active']);
        });

        DB::table('dadbot_models')->insert($this->dadbotModels());

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('dadbot_models', 'id'), (SELECT max(id) FROM dadbot_models), true)");
        }

        Schema::create('dodbot_conversations', function (Blueprint $table) {
            $table->id();
            $table->uuid('uuid')->unique();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('title', 100)->nullable();
            $table->unsignedSmallInteger('type')->default(DodbotConversationType::LegalQuestion->value);
            $table->foreignId('model_id')
                ->default(1)
                ->constrained('dadbot_models')
                ->restrictOnDelete();
            $table->string('status', 10)->default('active');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->index(['user_id', 'status', 'created_at']);
        });

        Schema::create('dodbot_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')
                ->constrained('dodbot_conversations')
                ->cascadeOnDelete();

            $table->unsignedInteger('in_tokens')->default(0);
            $table->unsignedInteger('out_tokens')->default(0);
            $table->text('prompt')->nullable();
            $table->text('response')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->index(['conversation_id', 'created_at']);
        });

        Schema::create('dodbot_purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();
            $table->foreignId('transaction_id')
                ->constrained('wallet_transactions')
                ->restrictOnDelete();

            $table->unsignedBigInteger('tokens');
            $table->unsignedBigInteger('price');
            $table->string('status', 10)->default('pending');
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();

            $table->index(['user_id', 'created_at']);
            $table->index(['status', 'created_at']);
            $table->unique('transaction_id');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE dodbot_balances ADD CONSTRAINT dodbot_balances_balance_check CHECK (balance >= 0)');

            DB::statement('ALTER TABLE dodbot_conversations ADD CONSTRAINT dodbot_conversations_type_check CHECK (type BETWEEN 1 AND 8)');
            DB::statement("ALTER TABLE dodbot_conversations ADD CONSTRAINT dodbot_conversations_status_check CHECK (status IN ('active', 'closed'))");

            DB::statement('ALTER TABLE dodbot_messages ADD CONSTRAINT dodbot_messages_in_tokens_check CHECK (in_tokens >= 0)');
            DB::statement('ALTER TABLE dodbot_messages ADD CONSTRAINT dodbot_messages_out_tokens_check CHECK (out_tokens >= 0)');

            DB::statement("ALTER TABLE dodbot_purchases ADD CONSTRAINT dodbot_purchases_status_check CHECK (status IN ('pending', 'completed', 'failed'))");
            DB::statement('ALTER TABLE dodbot_purchases ADD CONSTRAINT dodbot_purchases_tokens_check CHECK (tokens > 0)');
            DB::statement('ALTER TABLE dodbot_purchases ADD CONSTRAINT dodbot_purchases_price_check CHECK (price > 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('dodbot_purchases');
        Schema::dropIfExists('dodbot_messages');
        Schema::dropIfExists('dodbot_conversations');
        Schema::dropIfExists('dadbot_models');
        Schema::dropIfExists('dodbot_balances');
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function dadbotModels(): array
    {
        $now = now();

        return [
            $this->dadbotModel(1, 'OpenAI', 'gpt-5.5', 'GPT-5.5', 'elite', 5.00, 0.50, 30.00, $now),
            $this->dadbotModel(2, 'OpenAI', 'gpt-5.6-luna', 'GPT-5.6 Luna', 'expert', 1.00, 0.10, 6.00, $now),
            $this->dadbotModel(3, 'OpenAI', 'gpt-5.6-terra', 'GPT-5.6 Terra', 'senior', 2.50, 0.25, 15.00, $now),
            $this->dadbotModel(4, 'OpenAI', 'gpt-5.6-sol', 'GPT-5.6 Sol', 'elite', 5.00, 0.50, 30.00, $now),
            $this->dadbotModel(5, 'OpenAI', 'gpt-5.4-mini', 'GPT-5.4 Mini', 'trainee', 0.75, 0.075, 4.50, $now),
            $this->dadbotModel(6, 'OpenAI', 'gpt-5.4', 'GPT-5.4', 'senior', 2.50, 0.25, 15.00, $now),
            $this->dadbotModel(7, 'OpenAI', 'gpt-5.2', 'GPT-5.2', 'expert', 1.75, 0.18, 14.00, $now),
            $this->dadbotModel(8, 'OpenAI', 'gpt-4.1', 'GPT-4.1', 'expert', 2.00, 0.50, 8.00, $now),
            $this->dadbotModel(9, 'OpenAI', 'gpt-4o-mini', 'GPT-4o Mini', 'trainee', 0.15, 0.075, 0.60, $now),
            $this->dadbotModel(10, 'Anthropic', 'claude-sonnet-5', 'Claude Sonnet 5', 'senior', 2.00, 0.20, 10.00, $now),
            $this->dadbotModel(11, 'Anthropic', 'claude-sonnet-4-6', 'Claude Sonnet 4.6', 'senior', 3.00, 0.30, 15.00, $now),
            $this->dadbotModel(12, 'Anthropic', 'claude-3-5-haiku-20241022', 'Claude 3.5 Haiku', 'trainee', 1.00, 0.10, 5.00, $now),
            $this->dadbotModel(13, 'Google', 'gemini-3.1-pro-preview', 'Gemini 3.1 Pro Preview', 'senior', 2.00, null, 12.00, $now),
            $this->dadbotModel(14, 'Google', 'gemini-3.6-flash', 'Gemini 3.6 Flash', 'expert', 1.50, 0.15, 7.50, $now),
            $this->dadbotModel(15, 'Google', 'gemini-3.5-flash-lite', 'Gemini 3.5 Flash Lite', 'trainee', 0.30, 0.030, 2.50, $now),
            $this->dadbotModel(16, 'OpenAI', 'o3', 'o3', 'senior', 2.00, 0.50, 8.00, $now),
            $this->dadbotModel(17, 'OpenAI', 'gpt-5-mini', 'GPT-5 Mini', 'trainee', 0.25, null, 2.00, $now),
            $this->dadbotModel(18, 'OpenAI', 'gpt-5-nano', 'GPT-5 Nano', 'trainee', 0.050, null, 0.40, $now),
            $this->dadbotModel(19, 'OpenAI', 'gpt-5.3-codex-spark', 'GPT-5.3 Codex Spark', 'expert', 1.75, 0.18, 14.00, $now),
            $this->dadbotModel(20, 'Anthropic', 'claude-opus-4-1-20250805', 'Claude Opus 4.1', 'elite', 15.00, null, 75.00, $now),
            $this->dadbotModel(21, 'XAI', 'grok-4', 'Grok 4', 'senior', 3.00, null, 15.00, $now),
            $this->dadbotModel(22, 'XAI', 'grok-4.3', 'Grok 4.3', 'expert', 1.25, null, 2.50, $now),
            $this->dadbotModel(23, 'Google', 'gemini-2.5-pro', 'Gemini 2.5 Pro', 'elite', 2.50, null, 20.00, $now),
            $this->dadbotModel(24, 'Google', 'gemini-2.5-flash', 'Gemini 2.5 Flash', 'trainee', 0.30, null, 2.50, $now),
        ];
    }

    private function dadbotModel(
        int $id,
        string $provider,
        string $code,
        string $name,
        string $group,
        float $input,
        ?float $cached,
        float $output,
        mixed $now
    ): array {
        return [
            'id' => $id,
            'provider' => $provider,
            'code' => $code,
            'name' => $name,
            'group' => $group,
            'in_usd' => $input,
            'cache_usd' => $cached,
            'out_usd' => $output,
            'is_active' => true,
            'created_at' => $now,
            'updated_at' => $now,
        ];
    }
};
