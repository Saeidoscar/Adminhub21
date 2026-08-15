# AGENTS.md — apps/api (Laravel 13)

مکمل AGENTS.md ریشه. این فایل فقط قوانین مخصوص API را پوشش می‌دهد.

## Ignore these directories

Do not read or modify:

node_modules/
vendor/
.next/
.git/
storage/logs/
storage/framework/cache/
storage/framework/sessions/
storage/framework/views/

## Ignore these files

.env
.env.*
*.log


Ignore generated Docker volumes and data:

docker/volumes/
docker-data/
**/volumes/

## معماری

- **Pragmatic DDD layering**: منطق کسب‌وکار در Controller نمی‌ماند. لایه‌بندی معمول:
  `Http/Controllers` (نازک) → `Actions` یا `Services` (منطق) → `Models` / `Repositories` (دیتا).
  قبل از افزودن کلاس جدید، ساختار پوشه‌های فعلی `app/` را ببین و همان الگو را ادامه بده؛ الگوی جدید اختراع نکن.
- Route ها: نسخه‌دار زیر `/v1/`، بدون prefix اضافه‌ی `/api/`. تعریف در `routes/api.php` (یا معادل) با گروه‌بندی `Route::prefix('v1')`.
- **Auth:** Sanctum token-based، بدون stateful API (یعنی بدون کوکی SPA session سراسری قدیمی). فلو: check-mobile → OTP → register/login، هر مرحله یک endpoint مجزا.
- **Roles:** جدول `roles` + pivot `role_user`. Middleware نقش‌محور را قبل از هرکاری چک کن که از قبل وجود دارد یا نه.
- **Referral:** کد معرف از طریق `ad_dad_marketers` resolve می‌شود.

## دیتابیس (PostgreSQL 17)

- ~66 جدول normalize‌شده، طراحی‌شده از تحلیل schema قدیمی وردپرس (~70 جدول).
- تصمیم UUID vs BIGINT **جدول‌به‌جدول** است — قبل از تصمیم، جدول مشابه در schema فعلی را چک کن.
  - UUID (از طریق `pg_uuidv7`) جایی که شناسه ممکن است public-facing یا cross-system باشد.
  - BIGINT سریال جایی که فقط internal reference است و نیازی به غیرقابل‌حدس بودن نیست.
- ادغام‌های انجام‌شده که باید حفظ شوند (جدول جدید دوباره نساز مگر دلیل مشخص باشد):
  - سه گروه request→offer→chat→result → `service_requests` / `service_offers` / `service_results`
  - چهار جدول چت قدیمی → `conversations` + `messages`
  - جدول‌های پراکنده URL فایل → جدول polymorphic واحد `attachments`
- `pgvector` برای embedding های BGE-m3 — ستون embedding را با dimension صحیح تعریف کن، حدس نزن.
- Soft delete اجباری روی هر موجودیت حقوقی حساس (قرارداد، درخواست خدمات، نتیجه خدمات، ...).
- ستون `legacy_table` **فقط** وقتی اضافه می‌شود که چند جدول قدیمی با sequence همپوشان merge شده باشند.
- امنیت شناسه: از `slug` / `unique_code` / `pin_code` به‌جای افشای PK در هر endpoint عمومی یا لینک قابل اشتراک استفاده کن.

## Migration Tooling

- ابزار اصلی migration پایتون + SQLAlchemy است (نه Laravel migration commands برای data-migration؛ Laravel migrations فقط برای schema جدید).
- الزامات ابزار migration:
  - insert idempotent با `ON CONFLICT DO NOTHING`
  - resume امن در برابر crash با فایل state JSON
  - `tinyint(1)` صریحاً به boolean تبدیل شود
  - در docker-compose از `extra_hosts` برای دسترسی به MySQL قدیمی روی هاست استفاده شود
- قبل از migrate کردن یک جدول جدید، همیشه اول جدول(های) معادل قدیمی وردپرس/`DataMigrator` را چک کن که آیا تداخل نام (مثل تداخل slug شهر/استان‌های ایران) یا sequence مشترک وجود دارد یا نه.

## قوانین کد

- کوئری مستقیم SQL خام فقط در لایه migration/reporting مجاز است؛ در مسیر عادی اپلیکیشن از Eloquent/Query Builder استاندارد پروژه استفاده کن.
- تست‌ها: هر Action/Service جدید باید تست معادل داشته باشد مگر خلاف آن گفته شود (بسته به هر چه در `tests/` فعلی رایج است — همان الگو را ادامه بده، نه یک framework تست جدید).
- ENV/Secrets: هیچ‌وقت مقدار secret واقعی را در کد یا مثال کامیت نکن؛ همیشه `.env.example` را sync نگه دار.
