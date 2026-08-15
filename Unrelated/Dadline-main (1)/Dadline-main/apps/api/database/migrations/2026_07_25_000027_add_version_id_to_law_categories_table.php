<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $versionId = DB::table('law_versions')->insertGetId([
            'label' => 'Initial import',
            'status' => 'published',
            'published_at' => now(),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        Schema::table('law_categories', function (Blueprint $table) {
            $table->foreignId('version_id')
                ->nullable()
                ->after('id')
                ->constrained('law_versions')
                ->cascadeOnDelete();

            $table->index(['version_id', 'name']);
        });

        DB::table('law_categories')
            ->whereNull('version_id')
            ->update(['version_id' => $versionId]);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE law_categories ALTER COLUMN version_id SET NOT NULL');
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql' && Schema::hasColumn('law_categories', 'version_id')) {
            DB::statement('ALTER TABLE law_categories ALTER COLUMN version_id DROP NOT NULL');
        }

        Schema::table('law_categories', function (Blueprint $table) {
            if (Schema::hasColumn('law_categories', 'version_id')) {
                $table->dropIndex(['version_id', 'name']);
                $table->dropConstrainedForeignId('version_id');
            }
        });
    }
};
