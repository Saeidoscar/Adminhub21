---
name: adminhub-release-checklist
description: Use before releasing AdminHub21. Reads CI results, runs the release checklist, checks the deployment runbook, and writes the changelog entry. Never deploys or rotates secrets.
allowed-tools: shell httpRequest writeTodos simpleMemory
metadata:
  author: adminhub21
  version: "1.0"
  category: engineering
  icon: "lucide:Rocket"
  color: "#10b981"
  title: چک‌لیست انتشار AdminHub21
  summary: CI، تست، changelog، بازبینی قبل از تگ.
---

# چک‌لیست انتشار AdminHub21

## گام ۰ — قبل از هر چیز

```bash
git status --short
git log --oneline -5
gh run list --branch main --limit 3
```

اگر working tree کثیف است یا CI قرمز است، **متوقف شو** و گزارش بده.

## گام ۱ — CI

```bash
gh run list --branch main --limit 1 --json status,conclusion,headSha,displayTitle
gh run view <run-id> --log-failed | tail -80
```

خلاصه‌ی خطا باید شامل باشد: نام job، فایل، خط، نام تست. بدون این‌ها حدس نزن.

## گام ۲ — بررسی محلی

```bash
cd apps/api && composer test        # یا php artisan test
cd apps/web && pnpm build
cd apps/web && pnpm lint
```

اگر PHP یا pnpm در محیط نیست، از نتیجه‌ی CI به‌عنوان منبع استفاده کن و
صریح بنویس «محلی اجرا نشد».

## گام ۳ — بررسی تغییرات

```bash
git log --oneline $(git describe --tags --abbrev=0)..HEAD
git diff --stat $(git describe --tags --abbrev=0)..HEAD
```

برای هر تغییر بررسی کن:

- [ ] migration جدید؟ آیا برگشت‌پذیر است؟
- [ ] متغیر محیطی جدید؟ در `.env.example` هست؟
- [ ] تغییر قرارداد API؟ کلاینت هم به‌روز شده؟
- [ ] تغییر متن عمومی؟ changelog دارد؟
- [ ] وابستگی جدید با لایسنس سازگار؟
- [ ] تست جدید برای رفتار جدید؟

## گام ۴ — changelog

فرمت Keep a Changelog، فارسی، بخش‌های `افزوده` / `تغییر` / `اصلاح` / `امنیت`:

```markdown
## [۱.۰.۱] — ۱۴۰۵/۰۷/۲۸

### اصلاح

- خطای ۵۰۰ در بارگذاری تصویر بسته‌ی بزرگ‌تر از ۵ مگابایت (#۴۱۲)
```

## گام ۵ — تگ و انتشار (فقط با تأیید صریح انسان)

```bash
git tag -a v1.0.1 -m "AdminHub21 1.0.1"
git push origin v1.0.1
gh release create v1.0.1 --notes-file CHANGELOG.md
```

هر سه دستور دست‌نخورده در گزارش بنویس و منتظر «تأیید» بمان.

## گام ۶ — پس از انتشار

```bash
curl -fsS {API}/health
curl -fsSI https://adminhub21.com | head -5
```

پنج دقیقه‌ی اول: نرخ خطای ۵xx، زمان پاسخ، لاگ Horizon. اگر خطا بالا رفت،
rollback پیشنهاد بده (دستور دقیق، نه اجرا).

## خروجی

```text
انتشار {نسخه} — آماده/مسدود
CI: سبز (run 1234) | تست: ۸۴/۸۴ | build: موفق
migration: ۱ (برگشت‌پذیر) | env جدید: ندارد
changelog: نوشته شد
مسدودکننده: ...
تصمیم لازم: تأیید تگ و انتشار
```

## ممنوعیت‌ها

- `git push --force`, بازنویسی تاریخ، حذف شاخه یا تگ.
- `git tag`/`gh release`/دپلوی بدون تأیید صریح.
- چرخش `APP_KEY`, کلید درگاه، DNS.
- اجرای migration روی تولید.
- خاموش‌کردن تست برای سبز شدن CI.
