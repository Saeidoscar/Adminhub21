<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('law_versions', function (Blueprint $table) {
            $table->id();
            $table->string('label');
            $table->string('status', 20)->default('draft');
            $table->timestampTz('published_at')->nullable();
            $table->timestampsTz();

            $table->index('status');
            $table->index('published_at');
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("ALTER TABLE law_versions ADD CONSTRAINT law_versions_status_check CHECK (status IN ('draft', 'published', 'archived'))");
            DB::statement("CREATE UNIQUE INDEX law_versions_single_published ON law_versions (status) WHERE status = 'published'");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('law_versions');
    }
};
