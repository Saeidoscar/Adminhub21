// src/constants/legal-docs-data.ts

export const docsData = {
  brief: {
    title: "تنظیم لایحه دفاعیه",
    description: "تنظیم تخصصی لوایح حقوقی و کیفری توسط وکلای پایه یک...",
    price: "۱,۵۰۰,۰۰۰ تومان",
    features: ["بررسی مستندات", "بازبینی توسط تیم نظارت", "پشتیبانی ۴۸ ساعته"],
  },
  contract: {
    title: "تنظیم قرارداد اختصاصی",
    description: "نگارش متن قراردادهای تجاری، ملکی و پیمانکاری...",
    price: "۲,۵۰۰,۰۰۰ تومان",
    features: ["پوشش ریسک‌های حقوقی", "جلسه آنلاین پیش‌نویس", "اصلاحیه رایگان"],
  },
  // بقیه تایپ‌ها...
}

export type DocType = keyof typeof docsData
