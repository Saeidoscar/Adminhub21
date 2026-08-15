# Dadline Admin

پنل داخلی مدیریت Dadline بر پایه Next.js 16 و Auth.js است. تمام داده‌ها فقط از Laravel API دریافت می‌شوند و مرورگر مستقیماً به endpointهای ادمین دسترسی ندارد.

## متغیرهای ضروری

فایل `apps/admin/.env`:

```env
AUTH_SECRET=<strong-random-secret>
API_INTERNAL_URL=http://api:8080
ADMIN_PANEL_API_KEY=<same-strong-random-value-as-api>
```

فایل `apps/api/.env` نیز باید همین کلید را داشته باشد:

```env
ADMIN_PANEL_API_KEY=<same-strong-random-value-as-admin>
```

کلید را حداقل ۳۲ بایت تصادفی انتخاب کنید و هرگز با پیشوند `NEXT_PUBLIC_` تعریف نکنید. این کلید از سرور Next.js خارج نمی‌شود؛ هر درخواست با HMAC-SHA256، مسیر، بدنه و timestamp امضا می‌شود و Laravel امضاهای نامعتبر یا قدیمی‌تر از ۶۰ ثانیه را با پاسخ ۴۰۴ رد می‌کند. درخواست‌های مدیریتی علاوه بر امضای معتبر، به توکن Sanctum دارای ability اختصاصی `admin-panel:access` و نقش دقیق `admin` نیاز دارند.

## اجرا

```bash
pnpm --filter admin dev
pnpm --filter admin prettier
pnpm --filter admin build
```
