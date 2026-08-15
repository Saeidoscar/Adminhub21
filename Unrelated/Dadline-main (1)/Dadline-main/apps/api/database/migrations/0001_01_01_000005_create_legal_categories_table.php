<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('legal_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')
                ->nullable()
                ->constrained('legal_categories')
                ->cascadeOnDelete();
            $table->string('name', 100);
            $table->string('slug', 100)->unique();
        });

         DB::table('legal_categories')->insert([
            [
                'slug' => 'family',
                'name' => 'خانواده',
            ],
            [
                'slug' => 'criminal',
                'name' => 'کیفری',
            ],
            [
                'slug' => 'civil',
                'name' => 'مدنی',
            ],
            [
                'slug' => 'labor',
                'name' => 'روابط کار',
            ],
            [
                'slug' => 'international',
                'name' => 'مهاجرت و بین‌الملل',
            ],
            [
                'slug' => 'commercial',
                'name' => 'تجاری',
            ],
            [
                'slug' => 'administrative',
                'name' => 'اداری',
            ],
            [
                'slug' => 'environmental',
                'name' => 'محیط زیست',
            ],
            [
                'slug' => 'it',
                'name' => 'فناوری اطلاعات',
            ],
            [
                'slug' => 'tax',
                'name' => 'امور مالیاتی',
            ],
            [
                'slug' => 'real-estate',
                'name' => 'مالی و املاک',
            ],
            [
                'slug' => 'medical',
                'name' => 'پزشکی و بهداشت',
            ],
            [
                'slug' => 'education',
                'name' => 'تحصیلات و آموزش',
            ],
            [
                'slug' => 'contracting',
                'name' => 'پیمانکاری',
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('legal_categories');
    }
};
