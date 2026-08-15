<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_profiles', function (Blueprint $table) {
            $table->foreignId('user_id')->constrained()->cascadeOnDelete()->primary();
            $table->foreignId('photo_id')->nullable()->constrained('attachments')->nullOnDelete();
            $table->foreignId('insurance_document_id')->nullable()->constrained('attachments')->nullOnDelete();
            $table->json('platforms')->nullable();
            $table->json('skills')->nullable();
            $table->decimal('rating', 5, 2)->nullable();
            $table->string('insurance_number')->nullable();
            $table->integer('years_experience')->nullable();
            $table->decimal('hourly_rate', 10, 2)->nullable();
            $table->text('portfolio_summary')->nullable();
            $table->text('bio')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_profiles');
    }
};
