<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        foreach (['stories', 'blogs'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->unsignedBigInteger('dislikes_count')->default(0)->after('likes_count');
            });
        }

        Schema::create('content_reactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->morphs('reactionable');
            $table->string('type', 10);
            $table->timestampsTz();

            $table->unique(
                ['user_id', 'reactionable_type', 'reactionable_id'],
                'content_reactions_user_target_unique',
            );
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE content_reactions ADD CONSTRAINT content_reactions_type_check CHECK (type IN ('like', 'dislike'))");
            DB::statement('ALTER TABLE stories ADD CONSTRAINT stories_dislikes_count_check CHECK (dislikes_count >= 0)');
            DB::statement('ALTER TABLE blogs ADD CONSTRAINT blogs_dislikes_count_check CHECK (dislikes_count >= 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('content_reactions');

        foreach (['stories', 'blogs'] as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropColumn('dislikes_count');
            });
        }
    }
};
