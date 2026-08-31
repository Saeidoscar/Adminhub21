<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('custom_offers', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('package_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignUuid('admin_id')->constrained('admin_profiles')->cascadeOnDelete();
            $table->foreignUuid('employer_id')->constrained()->cascadeOnDelete();
            $table->string('employer_name');
            $table->string('name');
            $table->text('description');
            $table->json('platforms')->default('[]');
            $table->json('platform_configs')->default('[]');
            $table->integer('proposed_price_toman')->nullable();
            $table->integer('proposed_price_usd')->nullable();
            $table->string('billing_cycle'); // monthly | project | hourly
            $table->string('delivery_time')->nullable();
            $table->string('start_date')->nullable();
            $table->string('end_date')->nullable();
            $table->text('message')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('custom_offers');
    }
};
