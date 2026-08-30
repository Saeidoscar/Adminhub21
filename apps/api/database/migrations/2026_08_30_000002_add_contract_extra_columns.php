<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->json('step_data')->nullable()->after('status');
            $table->decimal('insurance_amount', 12, 2)->nullable()->after('step_data');
            $table->string('substitute_provider')->nullable()->after('insurance_amount');
            $table->timestamp('clauses_accepted_at')->nullable()->after('substitute_provider');
        });
    }

    public function down(): void
    {
        Schema::table('contracts', function (Blueprint $table) {
            $table->dropColumn(['step_data', 'insurance_amount', 'substitute_provider', 'clauses_accepted_at']);
        });
    }
};
