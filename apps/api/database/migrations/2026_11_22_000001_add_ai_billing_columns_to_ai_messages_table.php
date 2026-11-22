<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ai_messages', function (Blueprint $table): void {
            $table->unsignedBigInteger('cost_toman')->nullable()->after('out_tokens');
            $table->decimal('raw_cost_usd', 12, 8)->nullable()->after('cost_toman');
            $table->string('billing_source')->nullable()->after('raw_cost_usd');
        });
    }

    public function down(): void
    {
        Schema::table('ai_messages', function (Blueprint $table): void {
            $table->dropColumn(['cost_toman', 'raw_cost_usd', 'billing_source']);
        });
    }
};
