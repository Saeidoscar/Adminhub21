<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vendor_profiles', function (Blueprint $table) {

            $table->foreignId('user_id')
                ->primary()
                ->constrained()
                ->cascadeOnDelete();

            $table->string('slug')->nullable()->unique();

            $table->enum('vendor_type', [
                'lawyer',
                'expert',
                'judge',
            ])->default('lawyer');
            $table->json('documents')->nullable();
            $table->json('profile')->nullable();
            $table->json('license')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->index('vendor_type');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vendor_profiles');
    }
};
