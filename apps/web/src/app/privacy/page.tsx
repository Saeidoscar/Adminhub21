import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "حریم خصوصی",
  description: "چه داده‌ای در AdminHub21 ذخیره می‌شود، چرا، چه مدت، و چطور می‌توانید حذفش کنید.",
  alternates: { canonical: "/privacy" },
}

const SECTIONS = [
  {
    title: "۱. چه داده‌ای جمع می‌کنیم",
    body: "نام، ایمیل، شماره تماس، نقش (کارفرما یا متخصص)، اطلاعات بسته‌ها، سفارش‌ها، پیام‌های تیکت و تراکنش‌های کیف پول. برای احراز هویت متخصص ممکن است تصویر مدرک خواسته شود. اطلاعات کارت بانکی هرگز روی سرور ما ذخیره نمی‌شود؛ پرداخت در درگاه انجام می‌شود.",
  },
  {
    title: "۲. چرا",
    body: "برای اجرای قرارداد، نگه‌داشتن سابقه‌ی مالی، پاسخ به تیکت، جلوگیری از تقلب و بهبود محصول. هیچ داده‌ای برای تبلیغات شخص ثالث فروخته نمی‌شود.",
  },
  {
    title: "۳. کوکی و نشست",
    body: "توکن ورود در کوکی httpOnly نگه داشته می‌شود تا از دسترسی جاوااسکریپت در امان باشد. کوکی‌های تحلیلی، اگر فعال شوند، تجمیعی و بدون شناسه‌ی شخصی خواهند بود.",
  },
  {
    title: "۴. چه کسی می‌بیند",
    body: "کارمندهای پشتیبانی و مالی برای انجام وظیفه به بخشی از داده دسترسی دارند. ارائه‌دهنده‌ی زیرساخت و درگاه پرداخت فقط داده‌ی لازم برای سرویس خود را می‌بینند. داده به هیچ بازار تبلیغاتی داده نمی‌شود.",
  },
  {
    title: "۵. چه مدت",
    body: "داده‌ی حساب تا زمان فعال بودن حساب. سوابق مالی بر اساس الزامات حسابداری نگه داشته می‌شود. تیکت‌های بسته‌شده پس از ۲۴ ماه بایگانی یا حذف می‌شوند.",
  },
  {
    title: "۶. حقوق شما",
    body: "دسترسی به داده‌ی خود، اصلاح آن، و درخواست حذف حساب. درخواست حذف از طریق تیکت یا ایمیل ثبت می‌شود و حداکثر ۳۰ روز کاری اجرا می‌شود؛ مگر داده‌ای که نگه‌داشتنش الزام قانونی دارد.",
  },
  {
    title: "۷. امنیت",
    body: "ارتباط با TLS، توکن کوتاه‌عمر، حداقل دسترسی، بکاپ رمزنگاری‌شده و ثبت رخداد. در صورت رخداد امنیتی مؤثر بر داده‌ی شما، اطلاع‌رسانی می‌شود.",
  },
]

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-amber">Privacy</p>
      <h1 className="mt-2 text-3xl font-extrabold text-foreground">حریم خصوصی</h1>
      <p className="mt-3 text-sm text-muted">نسخه ۱٫۰ · مهر ۱۴۰۵</p>

      <div className="mt-10 space-y-8">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-extrabold text-foreground">{section.title}</h2>
            <p className="mt-2 text-sm leading-8 text-muted">{section.body}</p>
          </section>
        ))}
      </div>

      <p className="mt-12 rounded-xl border border-border bg-subtle p-4 text-xs leading-6 text-muted">
        برای هر درخواست مربوط به داده، از داخل حساب تیکت بزنید یا به hello@adminhub21.com بنویسید.
      </p>
    </div>
  )
}
