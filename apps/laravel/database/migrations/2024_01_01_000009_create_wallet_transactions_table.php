<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('wallet_id')->constrained()->cascadeOnDelete();
            $table->string('type'); // deposit | withdraw | transfer | payout | payment
            $table->integer('amount_toman')->default(0);
            $table->integer('amount_usd')->default(0);
            $table->string('currency');
            $table->string('status')->default('pending'); // pending | completed | failed | cancelled
            $table->string('reference_id')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('wallet_transactions');
    }
};
