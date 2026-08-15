<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_versions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')
                ->constrained('products')
                ->cascadeOnDelete();
            $table->unsignedInteger('version');
            $table->longText('content');
            $table->timestampTz('created_at')->useCurrent();

            $table->unique(['product_id', 'version']);
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE product_versions ADD CONSTRAINT product_versions_version_check CHECK (version > 0)');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('product_versions');
    }
};
