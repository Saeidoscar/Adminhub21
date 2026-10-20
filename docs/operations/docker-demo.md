# اجرای AdminHub21 روی Docker

این راهنما کل محصول را با Docker بالا می‌آورد: سایت عمومی و فضای کاری Next.js،
API لاراول، PostgreSQL، Redis و صف Horizon — همه با داده‌ی نمایشی آماده.

اگر فقط می‌خواهید **بدون نصب چیزی** برنامه را ببینید، نسخه‌ی ویندوزی (`.exe`)
ساده‌تر است: [راهنمای نسخه‌ی دسکتاپ](desktop-demo.md). تفاوت‌ها در بخش
[مقایسه](#۹-تفاوت-با-نسخهی-ویندوزی-exe) آمده است.

---

## ۱) پیش‌نیازها

| مورد | حداقل |
| --- | --- |
| Docker | Docker Desktop 4.x (ویندوز/مک) یا Docker Engine 24+ با Compose v2 (لینوکس) |
| رم | ۴ گیگابایت آزاد (بیلد Next و composer) |
| دیسک | حدود ۸ گیگابایت (ایمیج‌ها + volumeها) |
| پورت آزاد | `3000`, `8080`, `8443`, `8025`, `5432`, `6379` |

بررسی نصب:

```bash
docker --version
docker compose version
```

> اگر روی ویندوز کار می‌کنید، Docker Desktop را با بک‌اند WSL2 نصب کنید و ریپو
> را داخل WSL یا در مسیری پارس‌شده در Docker Desktop نگه دارید.

---

## ۲) بالا آوردن در سه دستور

```bash
git clone https://github.com/Saeidoscar/Adminhub21.git
cd Adminhub21
docker compose up --build -d
```

بیلد اول **۵ تا ۱۵ دقیقه** طول می‌کشد (ایمیج PHP + نصب Composer + نصب pnpm +
بیلد Next). اجراهای بعدی خیلی سریع‌ترند چون لایه‌ها کش شده‌اند.

وضعیت را ببینید:

```bash
docker compose ps
docker compose logs -f api workspace
```

کانتینر `api` اول منتظر PostgreSQL می‌ماند، بعد migrate می‌زند، داده‌ی نمایشی
را seed می‌کند و بعد php-fpm بالا می‌آید. وقتی لاگ `workspace` عبارت
`Ready` را نشان داد، مرورگر را باز کنید:

**<http://localhost:3000>**

> برای قطع دنبال‌کردن لاگ‌ها `Ctrl+C` بزنید؛ کانتینرها در پس‌زمینه زنده می‌مانند.

---

## ۳) آدرس‌ها

| سرویس | آدرس | توضیح |
| --- | --- | --- |
| سایت عمومی + فضای کاری (`/app`) | <http://localhost:3000> | همان Next.js 16 کامل |
| API لاراول (از طریق nginx) | <http://localhost:8080> | `GET /health` و `/api/v1/*` |
| پنل مدیریت قدیمی (SPA) | <http://localhost:8443> | بیلد production همان Vite |
| Mailpit (صندوق ایمیل تست) | <http://localhost:8025> | همه‌ی ایمیل‌ها اینجا می‌افتند |
| PostgreSQL | `localhost:5432` | کاربر/رمز: `postgres`/`postgres` |
| Redis | `localhost:6379` | — |

---

## ۴) ورود

| نقش | ایمیل | رمز |
| --- | --- | --- |
| کارفرمای نمونه | `demo@adminhub21.test` | `password` |
| متخصص | `expert@adminhub21.test` | `password` |
| مدیر کل | `admin@adminhub21.com` | `password` |

از `ورود` در سایت، یا مستقیم: <http://localhost:3000/sign-in>

---

## ۵) از قبل چه چیزی آماده است؟

داده‌ی نمایشی (seeder) روی هر نصب تازه این‌ها را می‌سازد و idempotent است
(اجرای دوباره رکورد تکراری نمی‌سازد):

- **۶ بسته‌ی منتشرشده** در بازار: «رشد اینستاگرام — پایه»، «استودیوی حرفه‌ای
  اینستاگرام»، «بسته‌ی کامل شبکه‌های اجتماعی»، «اسپرینت کمپین (۲ هفته)»،
  «بازبینی و تنظیم قرارداد» و «تقویم محتوای سه‌ماهه» — با قیمت، پلتفرم،
  تعداد فروش و بازدید.
- **دو قرارداد** برای کاربر نمونه: یکی فعال (`active`) با PDF آماده‌ی دانلود،
  یکی پیش‌نویس (`draft`).
- **کیف پول** با موجودی ۵٬۷۵۰٬۰۰۰ و سه تراکنش (شارژ، برداشت، پرداخت قرارداد).
- **دو تیکت**: یکی «در حال بررسی» با مکالمه‌ی دوطرفه، یکی «باز».
- **دو درگاه پرداخت** (زیبال، سامان).

می‌توانید خودتان ببینید:

```bash
docker compose exec api php artisan tinker --execute="echo App\Models\Package::count();"
curl -s http://localhost:8080/api/v1/marketplace/search | head -c 300
```

---

## ۶) دستورهای روزمره

```bash
docker compose ps                      # چه چیزی بالاست
docker compose logs -f workspace       # لاگ Next
docker compose logs -f api             # لاگ لاراول
docker compose stop                    # توقف بدون حذف
docker compose start                   # ادامه‌ی همان استک
docker compose down                    # توقف و حذف کانتینرها (داده‌ها می‌مانند)
```

اجرای دستور داخل کانتینر:

```bash
docker compose exec api php artisan migrate:status
docker compose exec api php artisan route:list
docker compose exec workspace sh          # داخل کانتینر Next
docker compose exec postgres psql -U postgres -d adminhub
```

---

## ۷) داده‌ها

داده در volumeهای نام‌دار می‌ماند: `pg_data`, `redis_data`, `api_storage`.
یعنی `docker compose down` داده را پاک نمی‌کند.

| کار | دستور |
| --- | --- |
| seed دوباره (بدون پاک‌کردن) | `docker compose exec api php artisan db:seed` |
| ساخت دوباره‌ی اسکیما + seed | `docker compose exec api php artisan migrate:fresh --seed` |
| پاک‌کردن کامل همه‌چیز | `docker compose down -v` |

بعد از `down -v`، اجرای بعدی `docker compose up -d` دیتابیس تازه می‌سازد و
دوباره seed می‌کند (چون `RUN_MIGRATIONS` و `SEED_DEMO` در compose روشن‌اند).

> `migrate:fresh` همه‌ی قراردادها، تیکت‌ها و تراکنش‌هایی که خودتان ساخته‌اید را
> پاک می‌کند و دموی اولیه را برمی‌گرداند.

---

## ۸) بعد از تغییر کد

| چه چیزی عوض شد | دستور |
| --- | --- |
| کد Next (`apps/web`) | `docker compose build workspace && docker compose up -d workspace` |
| کد لاراول (`apps/api`) | `docker compose restart api horizon` (کد bind mount است) |
| `composer.json` در لاراول | `docker compose build api horizon && docker compose up -d` |
| SPA قدیمی (`src/`) | `docker compose build web && docker compose up -d web` |
| `docker-compose.yml` | `docker compose up -d` |

### توسعه‌ی سریع Next بدون بیلد Docker

اگر می‌خواهید با hot-reload کار کنید، سرویس Next داخل Docker را بخوابانید و
روی سیستم خودتان اجرا کنید؛ API همان داخل Docker بماند:

```bash
docker compose stop workspace
pnpm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080 pnpm dev:web
```

`NEXT_PUBLIC_API_BASE_URL` را در همین لحظه (نه فقط بیلد) می‌خواند، چون همه‌ی
درخواست‌ها سمت سرور Next انجام می‌شوند.

---

## ۹) مقایسه با نسخه‌ی ویندوزی (`.exe`)

| | Docker | `.exe` ویندوز |
| --- | --- | --- |
| چیزی که اجرا می‌شود | لاراول واقعی + PostgreSQL + Redis + Next | Next + یک API نمایشی در حافظه |
| داده | پایدار در volume؛ با هر ری‌استارت می‌ماند | با هر اجرا از نو |
| پرداخت | درگاه شبیه‌سازی، تراکنش در دیتابیس | شبیه‌سازی‌شده، در حافظه |
| PDF قرارداد | با dompdf تولید می‌شود | فایل نمونه‌ی لاتین |
| مناسب برای | توسعه، تست، نمایش کامل محصول | نمایش سریع بدون نصب چیزی |
| پیش‌نیاز | Docker | ویندوز ۶۴ بیتی |

---

## ۱۰) عیب‌یابی

**پورت اشغال است** — مثلاً Postgres محلی روی ۵۴۳۲:

```bash
# در docker-compose.yml
ports:
  - "5433:5432"
```

**`database did not become reachable`** — معمولاً اولین اجرا و کندی راه‌اندازی
Postgres است:

```bash
docker compose logs postgres
docker compose restart api
```

**بازار خالی است** — seed اجرا نشده:

```bash
docker compose exec api php artisan db:seed
docker compose restart workspace
```

**ورود ناموفق است** — رمز همه‌ی حساب‌های دمو `password` است. اگر همچنان
`ارتباط با سرویس برقرار نشد` می‌گیرید، از دسترس‌پذیری API مطمئن شوید:

```bash
curl -s http://localhost:8080/api/v1/health
docker compose logs workspace | tail -30
```

**خطای دسترسی روی لینوکس** (`bootstrap/cache` یا `storage`):

```bash
docker compose exec -u root api sh -c "chown -R www-data:www-data bootstrap/cache storage"
docker compose restart api horizon
```

**بیلد روی ویندوز گیر می‌کند یا خطای `entrypoint: not found`** — فایل‌های
`.sh` باید LF باشند. ریپو با `.gitattributes` این را تضمین می‌کند؛ اگر کلون
قدیمی دارید:

```bash
git config core.autocrlf input
git rm --cached -r . >/dev/null && git reset --hard
```

**Apple Silicon (M1/M2/M3)** — ایمیج‌ها بومی arm64 ساخته می‌شوند و مشکلی
ندارند؛ فقط بیلد اول PHP کمی طول می‌کشد.

**شروع از صفر** — همه‌ی ایمیج‌ها و volumeها را دور بریزید:

```bash
docker compose down -v --rmi local
docker compose up --build -d
```

---

## ۱۱) فایل‌های مرتبط

| فایل | نقش |
| --- | --- |
| `docker-compose.yml` | استک کامل محلی (همان چیزی که این راهنما اجرا می‌کند) |
| `docker-compose.prod.yml` | استک تولیدی؛ `APP_KEY` و رمزها را از محیط می‌خواند |
| `apps/api/Dockerfile` | PHP 8.4 FPM + Composer + entrypoint (migrate/seed) |
| `apps/api/Dockerfile.nginx` | nginx لاراول (`/health`, `/api`, `/storage`) |
| `apps/web/Dockerfile` | ایمیج Next.js (سه مرحله: deps → build → runner) |
| `Dockerfile` | ایمیج SPA قدیمی (Vite) پشت nginx |
| `apps/api/docker/php/entrypoint.sh` | انتظار برای دیتابیس، migrate، seed |

برای استقرار روی سرور واقعی، `docker-compose.prod.yml` را ببینید و مقادیر
`APP_KEY`, `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, `SITE_URL` و
`NEXT_PUBLIC_SITE_URL` را از محیط بدهید.
