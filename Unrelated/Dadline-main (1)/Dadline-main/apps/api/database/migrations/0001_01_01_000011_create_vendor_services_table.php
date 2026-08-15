<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('vendor_services', function (Blueprint $table) {

            $table->id();

            $table->foreignId('user_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('service', 50);

            $table->boolean('enabled')
                ->default(true);

            $table->unsignedBigInteger('price')
                ->nullable();

            $table->json('settings')
                ->nullable();

            $table->unsignedInteger('sort')
                ->default(0);

            $table->timestamps();

            $table->unique(['user_id', 'service']);

            $table->index('service');
            $table->index('enabled');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('vendor_services');
    }
};
