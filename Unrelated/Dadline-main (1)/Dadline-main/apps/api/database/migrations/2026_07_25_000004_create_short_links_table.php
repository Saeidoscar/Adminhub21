<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('short_links', function (Blueprint $table): void {
            $table->id();
            $table->string('short_code', 10)->unique();
            $table->text('original_url')->unique();
            $table->unsignedBigInteger('clicks')->default(0);
            $table->timestampTz('created_at')->useCurrent();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement(
                'ALTER TABLE short_links ADD CONSTRAINT short_links_clicks_check CHECK (clicks >= 0)'
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('short_links');
    }
};
