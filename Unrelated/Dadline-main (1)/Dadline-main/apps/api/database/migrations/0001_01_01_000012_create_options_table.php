<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('options', function (Blueprint $table) {

            $table->id();

            $table->string('group', 100)
                ->default('general')
                ->index();

            $table->string('key', 191)
                ->unique();

            $table->jsonb('value');

            $table->boolean('autoload')
                ->default(false);

            $table->timestamps();
        });
    }


    public function down(): void
    {
        Schema::dropIfExists('options');
    }
};
