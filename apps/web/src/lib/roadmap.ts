export type PhaseStatus = "done" | "active" | "next"

export type Phase = {
  id: string
  title: string
  window: string
  status: PhaseStatus
  goal: string
  items: { label: string; done: boolean }[]
  exit: string
}

/**
 * Public roadmap. Mirrors docs/roadmap.md — keep the two in sync; the docs file
 * carries the reasoning, this one carries what visitors see.
 */
export const PHASES: Phase[] = [
  {
    id: "R0",
    title: "پایه",
    window: "تا نسخه ۱.۰.۰",
    status: "done",
    goal: "محصولی که کار می‌کند و قابل تحویل است.",
    items: [
      { label: "بازار، تعرفه، تغییرات، ورود و میزکار", done: true },
      { label: "قرارداد، کیف پول، تیکت و پنل ادمین", done: true },
      { label: "Next.js 16 + Laravel 12 / PHP 8.4 + PostgreSQL", done: true },
      { label: "۸۴ تست خودکار و CI سبز", done: true },
      { label: "دموی یک‌فرمانی با داده‌ی نمونه", done: true },
    ],
    exit: "نصب روی ماشین تازه بدون خطا بالا بیاید و مسیر خرید کامل کار کند.",
  },
  {
    id: "R1",
    title: "شرکت قابل ارائه",
    window: "۳۰ روز",
    status: "active",
    goal: "کسی که امروز سایت را باز می‌کند، به یک شرکت واقعی اعتماد کند.",
    items: [
      { label: "دفتر شرکت: معرفی، ساختار و مرزهای تصمیم", done: true },
      { label: "صفحه‌ی درباره ما و نقشه‌ی راه", done: true },
      { label: "قوانین و حریم خصوصی", done: true },
      { label: "تیم پشت‌صحنه با کارمندان هوش مصنوعی", done: false },
      { label: "لوگو و تصویر شبکه‌های اجتماعی", done: true },
      { label: "پروفایل لینکدین و اینستاگرام", done: false },
    ],
    exit: "یک غریبه در ۶۰ ثانیه بفهمد چه می‌فروشیم، چقدر است و چطور شروع کند.",
  },
  {
    id: "R2",
    title: "اولین درآمد",
    window: "۶۰ تا ۹۰ روز",
    status: "next",
    goal: "از محصول آماده به کسب‌وکار در حال کار.",
    items: [
      { label: "۱۰ متخصص تأییدشده در ۳ دسته", done: false },
      { label: "۲۵ بسته‌ی قیمت‌دار با توضیح کامل", done: false },
      { label: "اتصال درگاه واقعی و تست پرداخت سرتاسری", done: false },
      { label: "فاکتور و گزارش مالی ماهانه", done: false },
      { label: "۱۰ خرید واقعی", done: false },
    ],
    exit: "۱۰ تراکنش موفق، صفر اختلاف کیف پول، یک چرخه‌ی کامل خرید تا تسویه.",
  },
  {
    id: "R3",
    title: "زیرساخت ایران",
    window: "با اولین مشتری",
    status: "next",
    goal: "از دموی محلی به سرویس واقعی روی ابر در دسترس از ایران.",
    items: [
      { label: "انتقال دیتابیس و تست بازیابی", done: false },
      { label: "بکاپ خودکار و تمرین restore", done: false },
      { label: "Cloud Logs و هشدار خطای ۵xx", done: false },
      { label: "صف Horizon روی ماشین جدا", done: false },
      { label: "CDN روی دامنه و کش تصاویر", done: false },
    ],
    exit: "یک بازیابی کامل از بکاپ روی staging انجام شده باشد.",
  },
  {
    id: "R4",
    title: "مقیاس عملیات",
    window: "۳ تا ۶ ماه",
    status: "next",
    goal: "رشد بدون افزایش خطی هزینه‌ی انسانی.",
    items: [
      { label: "رفع گلوگاه‌های کوئری و ایندکس واقعی", done: false },
      { label: "صف برای ایمیل، تصویر و PDF قرارداد", done: false },
      { label: "تحلیل قیف بازار تا تسویه", done: false },
      { label: "گزارش هفتگی خودکار KPI", done: false },
      { label: "استخدام کارمندهای هوش مصنوعی چهارم تا هفتم", done: false },
    ],
    exit: "۱۰۰ سفارش در ماه با همان تعداد آدم.",
  },
  {
    id: "R5",
    title: "محصول و هوش",
    window: "۶ تا ۱۲ ماه",
    status: "next",
    goal: "چیزی بسازیم که کپی کردنش سخت باشد.",
    items: [
      { label: "دستیار هوشمند روی AIaaS آروان", done: false },
      { label: "قرارداد با امضای دیجیتال و آرشیو", done: false },
      { label: "API سازمانی و وب‌هوک", done: false },
      { label: "برنامه‌ی همکاری با پورسانت شفاف", done: false },
      { label: "PWA آفلاین‌پذیر", done: false },
    ],
    exit: "دستیار هوشمند در ۳۰٪ تیکت‌ها پیش‌نویس قابل‌استفاده بدهد.",
  },
]

export const NON_GOALS = [
  { idea: "اپ بومی اندروید/iOS در سال اول", why: "PWA کافی است؛ نگهداری دو کدبیس گران است" },
  { idea: "Kubernetes", why: "یک VM + Docker تا صدها سفارش در ماه کافی است" },
  { idea: "مدل زبانی اختصاصی", why: "هزینه‌ی GPU از فایده بیشتر است؛ از AIaaS استفاده می‌کنیم" },
  { idea: "پرداخت رمزارزی", why: "ریسک قانونی و پشتیبانی، بدون تقاضای اثبات‌شده" },
  { idea: "بازار بین‌المللی", why: "تمرکز روی فارسی، مزیت واقعی ماست" },
]

export const HOSTING = {
  note: "پیشنهاد شروع، حدود ۴٫۵ میلیون تومان در ماه؛ DBaaS و صف مدیریت‌شده با اولین درآمد اضافه می‌شود.",
  rows: [
    { service: "Cloud Server", spec: "۲ vCPU / ۴GB / ۶۰GB SSD", price: "۲٬۴۹۱٬۴۰۰" },
    { service: "CDN", spec: "پلن Base", price: "۰" },
    { service: "Object Storage", spec: "Growth — ۵۰۰GB / ۲TB", price: "۱٬۵۰۰٬۰۰۰" },
    { service: "AIaaS", spec: "مصرف ماهانه", price: "۱٬۹۸۷٬۲۰۰" },
  ],
  total: "۴٬۴۸۰٬۰۰۰",
}
