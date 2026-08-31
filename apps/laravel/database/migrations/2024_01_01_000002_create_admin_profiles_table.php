<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_profiles', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('user_id')->constrained()->cascadeOnDelete();
            $table->string('photo')->nullable();
            $table->double('rating')->default(0);
            $table->integer('reviews')->default(0);
            $table->boolean('verified')->default(false);
            $table->boolean('insured')->default(false);
            $table->integer('monthly_toman')->default(0);
            $table->integer('monthly_usd')->default(0);
            $table->text('bio_en')->nullable();
            $table->text('bio_fa')->nullable();
            $table->json('skills_en')->default('[]');
            $table->json('skills_fa')->default('[]');
            $table->json('platforms')->default('[]');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_profiles');
    }
};
