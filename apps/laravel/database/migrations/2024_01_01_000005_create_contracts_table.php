<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contracts', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('code')->unique();
            $table->foreignUuid('employer_id')->constrained();
            $table->foreignUuid('admin_id')->constrained('admin_profiles');
            $table->string('platform');
            $table->string('status')->default('pending'); // active | pending | completed | disputed
            $table->integer('amount_toman');
            $table->integer('amount_usd');
            $table->boolean('has_insurance')->default(false);
            $table->boolean('has_substitute')->default(false);
            $table->text('term_clause')->nullable();
            $table->text('substitute_clause')->nullable();
            $table->string('start_date')->nullable();
            $table->string('end_date')->nullable();
            $table->string('signed_by_employer_at')->nullable();
            $table->string('signed_by_admin_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
