<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cases', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->foreignUuid('admin_id')->constrained('admin_profiles')->cascadeOnDelete();
            $table->foreignUuid('employer_id')->constrained()->cascadeOnDelete();
            $table->string('title');
            $table->text('description');
            $table->string('priority')->default('medium'); // low | medium | high | urgent
            $table->string('status')->default('open'); // open | in_progress | review | closed
            $table->json('tags')->default('[]');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cases');
    }
};
