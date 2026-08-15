<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('cities')
                ->nullOnDelete();
            $table->string('name');
            $table->string('slug', 100)->unique();
            $table->timestamps();
            $table->index('parent_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cities');
    }
};
