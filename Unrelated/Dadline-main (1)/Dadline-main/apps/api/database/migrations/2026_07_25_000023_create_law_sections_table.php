<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('law_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('title_id')
                ->constrained('law_titles')
                ->cascadeOnDelete();
            $table->string('name', 550);
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('title_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('law_sections');
    }
};
