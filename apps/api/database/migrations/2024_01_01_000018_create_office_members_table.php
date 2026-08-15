<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('office_members', function (Blueprint $table) {
            $table->id();
            $table->foreignId('office_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->nullable();
            $table->boolean('can_access')->default(true);
            $table->json('permissions')->nullable();
            $table->timestamp('created_at')->nullable();
            $table->unique(['office_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('office_members');
    }
};
