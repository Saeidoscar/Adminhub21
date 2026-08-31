<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('comments', function (Blueprint $table) {
            $table->uuid('id')->primary()->default(DB::raw('gen_random_uuid()'));
            $table->uuid('post_id');
            $table->string('post_type');
            $table->foreignUuid('author_id')->constrained()->cascadeOnDelete();
            $table->uuid('parent_id')->nullable();
            $table->text('body');
            $table->timestamps();

            $table->unique(['post_id', 'author_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('comments');
    }
};
