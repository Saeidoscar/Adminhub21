<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sms_templates', function (Blueprint $table) {

            $table->id();

            // کلید داخلی سیستم
            // مثال: otp_login
            $table->string('key')
                ->unique();

            // عنوان برای پنل ادمین
            // مثال: کد ورود
            $table->string('title');

            // متن پیام
            // مثال: کد تایید شما: {code}
            $table->text('content');

            // متغیرهای قابل جایگزینی
            // مثال: ["code"]
            $table->jsonb('variables')
                ->nullable();

            // پترن Provider ها
            // مثال:
            // {
            //   "melipayamak": {"id":"12345"},
            //   "adlsms": {"id":"98765"}
            // }
            $table->jsonb('patterns')
                ->nullable();

            $table->boolean('active')
                ->default(true);

            $table->timestamps();

        });
    }


    public function down(): void
    {
        Schema::dropIfExists('sms_templates');
    }
};