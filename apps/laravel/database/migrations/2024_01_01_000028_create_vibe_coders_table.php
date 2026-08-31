<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vibe_coders', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->string('name_en');
            $table->string('name_fa');
            $table->string('photo');
            $table->string('stack');
            $table->double('rating')->default(0);
            $table->integer('reviews')->default(0);
            $table->integer('projects')->default(0);
            $table->integer('rate_toman');
            $table->integer('rate_usd');
            $table->string('delivery');
            $table->text('bio_en');
            $table->text('bio_fa');
            $table->boolean('active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vibe_coders');
    }
};
