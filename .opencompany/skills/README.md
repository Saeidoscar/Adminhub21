# مهارت‌های AdminHub21 برای OpenCompany

این پوشه مهارت‌های آماده‌ی شرکت است. OpenCompany پوشه‌ی
`<workspace>/.opencompany/skills` را بازگشتی اسکن می‌کند
(`server/services/skill_loader.py` → `_default_skill_dirs`), پس هر `SKILL.md`
در هر عمقی پیدا می‌شود.

```
.opencompany/skills/adminhub/<skill-name>/SKILL.md
```

## فهرست

| مهارت                            | چه کاری می‌کند                                          | نقش مرتبط |
| -------------------------------- | ------------------------------------------------------ | --------- |
| `adminhub-ticket-triage`         | صف تیکت را می‌خواند، دسته‌بندی می‌کند، پاسخ پیش‌نویس می‌زند | پشتیبانی  |
| `adminhub-listing-review`        | بسته‌های بازار را با قواعد فهرست بررسی می‌کند            | بازار     |
| `adminhub-release-checklist`     | چک‌لیست انتشار + خواندن CI                              | انتشار    |
| `adminhub-wallet-reconciliation` | تطبیق کیف پول و صف برداشت                              | مالی      |
| `adminhub-growth-report`         | گزارش هفتگی رشد + تقویم محتوا                          | رشد       |
| `adminhub-competitor-scan`       | رصد رقیب و قیمت، یادداشت تصمیم                         | پژوهش     |
| `adminhub-daily-brief`           | بریف صبح ۱۵ خطی از وضعیت همه‌ی نقش‌ها                    | ستاد      |

## سه راه نصب

**۱) از طریق workspace (توصیه‌شده).** پوشه‌ی `ops/opencompany/` یا کل مخزن را
در OpenCompany به‌عنوان workspace باز کنید، سپس `company start` را از ریشه‌ی
مخزن اجرا کنید. مهارت‌ها خودکار در کتابخانه ظاهر می‌شوند.

**۲) کپی به نصب OpenCompany.** پوشه‌ی `adminhub/` را به
`<محل نصب OpenCompany>/server/skills/adminhub/` کپی کنید؛ در تب Skills روی
پوشه‌ی `adminhub` دکمه‌ی Scan Folder را بزنید.

**۳) دستی از UI.** Settings → Skills → New Skill؛ برای هر فایل، `name` و
`description` را از frontmatter بردارید و متن بدنه را در ادیتور بچسبانید.
مناسب وقتی فقط یکی دو مهارت را می‌خواهید.

## قاعده‌ی frontmatter

```yaml
---
name: adminhub-example # یکتا، با خط تیره
description: Use when ... # یک جمله؛ مدل از این برای انتخاب مهارت استفاده می‌کند
allowed-tools: httpRequest shell pythonExecutor browser simpleMemory writeTodos
metadata:
  author: adminhub21
  version: "1.0"
  category: support # support | money | growth | engineering | research | ops
  icon: "lucide:Ticket"
  color: "#f59e0b"
  title: عنوان فارسی
  summary: یک خط توضیح فارسی
---
```

`allowed-tools` فهرست گره‌های مجاز است (با فاصله جدا می‌شود) و فقط دسترسی
مهارت را محدود می‌کند، نه بیشتر. اگر ابزاری در نصب شما فعال نیست، همان‌جا
حذفش کنید.

## تنظیم آدرس API

همه‌ی مهارت‌ها فرض می‌کنند API روی `http://localhost:8080/api/v1` است (دمو) یا
`https://api.adminhub21.com/api/v1` (تولید). برای کار روی دمو:

```bash
docker compose -f docker-compose.demo.yml up -d
# ورود ادمین: admin@adminhub21.com / password
```

توکن را از `POST /api/v1/auth/login` بگیرید و در متغیر محیطی مهارت
(`ADMINHUB_TOKEN`) نگه دارید. هیچ مهارتی رمز را در متن نمی‌نویسد.

## هزینه و ریسک

هر مهارت با یک مدل اقتصادی اجرا می‌شود (GPT-5 mini یا معادل). تخمین:
**۵ تا ۲۰ دلار در ماه** برای هفت نقش با ریتم فعلی — جزئیات در
[`docs/operations/opencompany.md`](../../../docs/operations/opencompany.md).
