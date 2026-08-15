<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('options', function (Blueprint $table) {
            $table->id();
            $table->string('group');
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->boolean('autoload')->default(false);
            $table->timestamps();
            $table->index(['group', 'autoload']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('options');
    }
};
