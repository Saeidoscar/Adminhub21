---
name: adminhub-wallet-reconciliation
description: Use for daily wallet reconciliation and the withdrawal queue. Compares balances with transactions and gateway records, flags mismatches, and drafts approve or reject recommendations without moving money.
allowed-tools: httpRequest pythonExecutor simpleMemory writeTodos
metadata:
  author: adminhub21
  version: "1.0"
  category: money
  icon: "lucide:Wallet"
  color: "#fbbf24"
  title: تطبیق کیف پول
  summary: کنترل روزانه‌ی موجودی، تراکنش و صف برداشت.
---

# تطبیق کیف پول AdminHub21

## قانون اول

**تو پول جابه‌جا نمی‌کنی.** نه تأیید برداشت، نه استرداد، نه اصلاح موجودی.
خروجی تو یک **پیشنهاد مکتوب** است.

## گام ۱ — صف برداشت

```
GET {API}/admin/wallet/withdrawals/pending
```

برای هر درخواست: `id`, `user.id`, `user.name`, `amount`, `iban`,
`created_at`, `user.wallet_balance`.

## گام ۲ — بررسی هر برداشت

| بررسی   | قبول                             | رد                       |
| ------- | -------------------------------- | ------------------------ |
| موجودی  | `amount <= withdrawable_balance` | بیشتر از موجودی          |
| سن حساب | بیش از ۳۰ روز                    | کمتر از ۷ روز + مبلغ بالا |
| سابقه   | حداقل یک فروش موفق               | هیچ فروش/خرید            |
| IBAN    | به نام همان کاربر                | اسم متفاوت               |
| تکرار   | برداشت قبلی تسویه شده            | دو برداشت در ۲۴ ساعت     |
| شکایت   | تیکت باز مالی ندارد              | تیکت «پولم برنگشت»       |

پیشنهاد:

```text
#۱۸ | مریم ر. | ۱۲٬۰۰۰٬۰۰۰ ریال | حساب ۹۰ روزه | ۳ فروش موفق | IBAN هم‌نام
پیشنهاد: تأیید — همه‌ی بررسی‌ها سبز
```

```text
#۱۹ | حساب ۴ روزه | ۸٬۵۰۰٬۰۰۰ ریال | صفر فروش | IBAN متفاوت
پیشنهاد: رد — حساب تازه + IBAN ناهم‌نام (قاعده ۲ و ۴)
اقدام: درخواست مدارک هویتی از طریق پشتیبانی
```

## گام ۳ — تطبیق روزانه

```
GET {API}/admin/dashboard/stats
GET {API}/admin/wallet/withdrawals/pending
```

از دیتابیس یا API، برای هر کیف پول:

```text
موجودی ثبت‌شده  ==  مجموع تراکنش‌های تأییدشده
```

اگر اختلاف > ۰:

- کمتر از ۱٬۰۰۰٬۰۰۰ ریال: در گزارش روزانه با شناسه‌ی کاربر.
- بیشتر از ۱٬۰۰۰٬۰۰۰ ریال: **هشدار فوری**، توقف صف برداشت.

نمونه‌ی بررسی با python:

```python
pending = sum(t["amount"] for t in tx if t["status"] == "pending")
approved = sum(t["amount"] for t in tx if t["status"] == "approved")
assert balance == approved - withdrawals, "mismatch"
```

## گام ۴ — پیگیری

- تراکنش `pending` بیش از ۳۰ دقیقه → بررسی callback درگاه.
- برداشت تأییدشده‌ی بیش از ۲۴ ساعت → پیگیری واریز.
- ایمیل یادآوری فقط پیش‌نویس؛ ارسال با تأیید.

## خروجی روزانه

```text
مالی — {تاریخ}
صف برداشت: ۳ (پیشنهاد تأیید: ۲ | رد: ۱)
اختلاف تطبیق: صفر
تراکنش معلق: ۱ (#T-881، ۴۰ دقیقه)
تصمیم لازم: تأیید برداشت #۱۸ و #۲۰
```

## ممنوعیت‌ها

- `PUT /admin/wallet/withdrawals/{id}/approve` بدون تأیید صریح.
- ذخیره‌ی شماره کارت کامل، CVV یا رمز.
- تغییر `wallet_transactions` یا موجودی.
- تأیید برداشت به حساب شخص ثالث.
