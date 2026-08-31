<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('packages', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('admin_id')->constrained('admin_profiles')->cascadeOnDelete();
            $table->string('name');
            $table->text('description');
            $table->string('type'); // platform | bundle
            $table->json('platforms')->default('[]');
            $table->json('platform_configs')->default('[]');
            $table->integer('price_toman');
            $table->integer('price_usd');
            $table->string('billing_cycle'); // monthly | project | hourly
            $table->string('delivery_time');
            $table->boolean('featured')->default(false);
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('packages');
    }
};
