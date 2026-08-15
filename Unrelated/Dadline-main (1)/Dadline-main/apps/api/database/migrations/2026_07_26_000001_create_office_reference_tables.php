<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('office_referral_authorities', function (Blueprint $table): void {
            $table->id();
            $table->string('name', 100);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);

            $table->index(['is_active', 'sort_order']);
        });

        DB::table('office_referral_authorities')->insert([
            ['id' => 1, 'name' => 'شورای حل اختلاف', 'sort_order' => 10],
            ['id' => 2, 'name' => 'محاکم حقوقی', 'sort_order' => 20],
            ['id' => 3, 'name' => 'محاکم کیفری یک', 'sort_order' => 30],
            ['id' => 4, 'name' => 'محاکم کیفری دو', 'sort_order' => 40],
            ['id' => 5, 'name' => 'محاکم خانواده', 'sort_order' => 50],
            ['id' => 6, 'name' => 'اجرای احکام مدنی/کیفری', 'sort_order' => 60],
            ['id' => 7, 'name' => 'دادگاه های صلح', 'sort_order' => 70],
            ['id' => 8, 'name' => 'دادسرا', 'sort_order' => 80],
            ['id' => 9, 'name' => 'محاکم تجدیدنظر', 'sort_order' => 90],
            ['id' => 10, 'name' => 'دیوان عالی کشور', 'sort_order' => 100],
            ['id' => 11, 'name' => 'دیوان عدالت اداری', 'sort_order' => 110],
            ['id' => 12, 'name' => 'دادسرا و دادگاه نظامی', 'sort_order' => 120],
            ['id' => 13, 'name' => 'دادگاه انقلاب', 'sort_order' => 130],
            ['id' => 14, 'name' => 'دادگاه روحانیت', 'sort_order' => 140],
            ['id' => 20, 'name' => 'سایر مراجع', 'sort_order' => 200],
        ]);

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("SELECT setval(pg_get_serial_sequence('office_referral_authorities', 'id'), COALESCE((SELECT MAX(id) FROM office_referral_authorities), 1), true)");
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('office_referral_authorities');
    }
};
