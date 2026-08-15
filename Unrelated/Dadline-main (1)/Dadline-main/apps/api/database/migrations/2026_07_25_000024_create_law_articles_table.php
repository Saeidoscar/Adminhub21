<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('law_articles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('section_id')
                ->constrained('law_sections')
                ->cascadeOnDelete();
            $table->text('content');
            $table->integer('display_order')->default(0);
            $table->timestampTz('updated_at')->useCurrent();

            $table->index('section_id');
            $table->index(['section_id', 'display_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('law_articles');
    }
};
