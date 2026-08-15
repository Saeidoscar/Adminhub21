<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('law_titles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')
                ->constrained('law_categories')
                ->cascadeOnDelete();
            $table->string('title', 550);
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('category_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('law_titles');
    }
};
