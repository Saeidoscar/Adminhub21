<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affiliate_commissions', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('code_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('referrer_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('referred_id')->constrained()->cascadeOnDelete();
            $table->integer('amount_toman')->default(0);
            $table->integer('amount_usd')->default(0);
            $table->string('status')->default('pending');
            $table->string('paid_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affiliate_commissions');
    }
};
