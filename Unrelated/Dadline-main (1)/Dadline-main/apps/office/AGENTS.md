# AGENTS.md — apps/office (Next.js 16 — پنل وکلا/دفاتر حقوقی)

مکمل AGENTS.md ریشه.

> ⚠️ همانند فایل admin، این فایل بر اساس معماری مشترک نوشته شده و بخش «ماژول‌های اختصاصی وکیل»
> نیاز به تکمیل توسط خودت دارد (مثلاً: مدیریت پیشنهاد قیمت روی `service_offers`، چت با موکل،
> تقویم/زمان‌بندی، پرونده‌های فعال، صورت‌حساب اشتراک ماهانه).

## نقش این app

پنل کاری وکلا/دفاتر حقوقی — دریافت `service_requests`، ارسال `service_offers`، مدیریت
`conversations`/`messages` با موکل، مشاهده `service_results`، و مدیریت اشتراک ماهانه (subscription).

## قوانین معماری

- همان قانون سخت‌گیرانه ریشه: فقط از طریق Laravel API `/v1/`، بدون ORM مستقیم، بدون اتصال مستقیم DB.
- همان الگوی `apiClient.ts` (داخلی Docker برای Server Actions / عمومی برای client).
- Auth: Auth.js v5 + Sanctum؛ این app باید تایید کند کاربر لاگین‌شده role وکیل/دفتر دارد
  (نه صرفاً کاربر عادی) — چک از طریق `roles`/`role_user` سمت API، نه فقط فرض client-side.
- **چت (`conversations` + `messages`):** اگر realtime لازم است (پیام جدید، وضعیت آنلاین)،
  از مکانیزم موجود پروژه (وب‌سوکت/polling/Pusher و غیره — هرکدام که در schema/زیرساخت فعلی است) استفاده کن؛
  چیزی جدید معماری نکن مگر صریحاً خواسته شود.
- **Attachments:** آپلود فایل (مدارک، ضمائم پرونده) باید از طریق جدول polymorphic `attachments`
  و storage نهایی روی ParsPack (S3-compatible) برود، نه ذخیره مستقیم لوکال یا مسیر جدید.

## داده‌های حساس

- این app به اطلاعات پرونده حقوقی موکل‌ها دسترسی دارد. دسترسی وکیل باید محدود به
  پرونده‌های مرتبط با خودش باشد (authorization سمت API، نه فقط فیلتر UI).
- عملیات حذف روی `service_requests` / `service_offers` / `service_results` باید soft delete باشد.

## قوانین کلی کد

- کد کامل و production-ready، بدون placeholder.
- کامپوننت/استایل مشترک با `web`/`admin` را از `packages/` بگیر.
