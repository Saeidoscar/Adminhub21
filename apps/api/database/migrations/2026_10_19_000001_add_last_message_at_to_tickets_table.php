<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * AddTicketMessageAction updated `last_message_at` on every reply, but the
     * column never existed, so every reply failed with an unknown-column error.
     */
    public function up(): void
    {
        Schema::table('tickets', function (Blueprint $table): void {
            $table->timestamp('last_message_at')->nullable()->after('resolved_at');
            $table->index(['status', 'last_message_at']);
        });
    }

    public function down(): void
    {
        Schema::table('tickets', function (Blueprint $table): void {
            $table->dropIndex(['status', 'last_message_at']);
            $table->dropColumn('last_message_at');
        });
    }
};
