# AGENTS.md — apps/web (Next.js 16 — سایت عمومی کاربران)

مکمل AGENTS.md ریشه.

## نقش این app

سایت عمومی/مشتریان Dadline: صفحات landing، `/lawyer` (سگمنت‌های داینامیک SEO-friendly)،
`/contracts`، `/ai` (Dadbot/دادبات)، `/questions`، و مسیر ثبت‌نام/ورود کاربر.

## قوانین معماری Next.js (خودت این‌ها را قبلاً enforce کرده‌ای — رعایتشان اجباری است)

- **همه دسترسی به داده از طریق Laravel API روی HTTP** — هیچ ORM مستقیم، هیچ اتصال مستقیم به Postgres.
- `apiClient.ts`:
  - در **Server Actions / Server Components** از URL داخلی شبکه Docker استفاده کن.
  - در فراخوانی‌های **client-side/browser** از URL عمومی استفاده کن.
  - این دو را با هم قاطی نکن؛ اگر مطمئن نیستی کدام context را داری، بپرس یا چک کن نه حدس بزن.
- **Validation:** Zod، با schema که ورودی/خروجی API را از snake_case به camelCase (و برعکس هنگام ارسال) transform می‌کند. این transform را در یک لایه مرکزی نگه دار، نه پراکنده در هر component.
- **Auth:** Auth.js v5 در سمت Next.js، هماهنگ با Sanctum cookie-based سمت Laravel. فلو استاندارد: check-mobile → OTP → register/login.
- SEO: صفحات public-facing (خصوصاً `/lawyer/[slug]`) باید metadata/OG صحیح و SSR/ISR مناسب داشته باشند؛ کلاینت-فقط رندر برای این صفحات قابل قبول نیست.

## استایل و UI

- زبان رابط کاربری فارسی و RTL است (مثل لندینگ دادبات). همیشه فرض کن layout باید RTL-first باشد مگر صفحه‌ای صراحتاً انگلیسی/LTR باشد.
- برای هر کامپوننت جدید UI مشترک، اول چک کن در `packages/ui` (یا معادل) موجود است یا نه؛ کپی نکن.

## قوانین کلی کد

- کد کامل و production-ready تحویل بده، نه placeholder.
- قبل از افزودن پکیج جدید npm، چک کن معادلش در `packages/` مونوریپو موجود نیست.
- نصب پکیج از میرور Liara انجام می‌شود (فیلترینگ ایران) — اگر نصب fail شد اول این را بررسی کن.
