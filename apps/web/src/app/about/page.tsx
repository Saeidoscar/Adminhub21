import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "درباره ما",
  description:
    "AdminHub21 بازار متخصصان محتوا، ابزار و قرارداد است؛ شرکتی کوچک با فرایندهای مکتوب، قیمت شفاف و پول تا زمان تحویل در امانت.",
  alternates: { canonical: "/about" },
}

const VALUES = [
  {
    title: "شفافیت",
    body: "قیمت هر بسته، وضعیت هر تیکت و تاریخ هر انتشار قابل دیدن است. چیزی پشت پرده نمی‌ماند.",
  },
  {
    title: "پول را آدم تأیید می‌کند",
    body: "هیچ عامل خودکاری پرداخت، برداشت یا استرداد انجام نمی‌دهد. این خط قرمز ماست.",
  },
  {
    title: "کوچک بفرست، سریع درست کن",
    body: "انتشار هفتگی و اصلاح سریع، بهتر از یک نسخه‌ی بزرگ و دیر است.",
  },
  {
    title: "هر تصمیم یک سند دارد",
    body: "نقشه‌ی راه، changelog، runbook و قواعد بازار — همه نوشته می‌شوند تا فراموش نشوند.",
  },
  {
    title: "داده‌ی مشتری امانت است",
    body: "حداقل دسترسی، حداقل نگهداری، حداقل اشتراک. حذف داده با درخواست صاحبش انجام می‌شود.",
  },
  {
    title: "بدون وعده‌ی توخالی",
    body: "«تضمین رتبه»، «تضمین درآمد» و «بدون باگ» را نمی‌فروشیم. کاری که می‌توانیم را می‌گوییم.",
  },
]

const NUMBERS = [
  { value: "۸۴", label: "تست خودکار" },
  { value: "۱۸۶", label: "مسیر API" },
  { value: "۲۴/۷", label: "پیگیری وضعیت" },
  { value: "۱٬۰", label: "نسخه‌ی منتشرشده" },
]

const TEAM = [
  { role: "بنیان‌گذار", focus: "تصمیم، قیمت، استخدام، انتشار" },
  { role: "ستاد فرماندهی", focus: "بریف روزانه و پیگیری تصمیم‌ها" },
  { role: "پشتیبانی", focus: "صف تیکت و پاسخ مشتری" },
  { role: "عملیات بازار", focus: "کیفیت بسته‌ها و دسته‌بندی" },
  { role: "مالی", focus: "تطبیق کیف پول و صف برداشت" },
  { role: "انتشار", focus: "CI، changelog و آماده‌سازی نسخه" },
]

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <nav className="text-xs text-muted" aria-label="مسیر">
        <Link href="/" className="hover:text-foreground">
          خانه
        </Link>
        <span className="mx-2">/</span>
        <span>درباره ما</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-wider text-amber">About</p>
        <h1 className="mt-2 text-3xl font-extrabold leading-tight text-foreground md:text-5xl">
          کار محتوایی، از دایرکت تا قرارداد.
        </h1>
        <p className="mt-5 text-base leading-8 text-muted">
          AdminHub21 بازار دوطرفه‌ای است که کارفرما را به متخصص تأییدشده وصل می‌کند و کل مسیر را
          تا قیمت شفاف، قرارداد الکترونیکی، تحویل و تسویه در یک سیستم نگه می‌دارد. چیزی که قبلاً
          در دایرکت و واتساپ شروع می‌شد، حالا قابل استناد است.
        </p>
      </header>

      <section className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4" aria-label="اعداد">
        {NUMBERS.map((item) => (
          <div key={item.label} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-2xl font-extrabold text-navy">{item.value}</p>
            <p className="mt-1 text-xs text-muted">{item.label}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 grid gap-8 md:grid-cols-2" aria-labelledby="story">
        <div>
          <h2 id="story" className="text-2xl font-extrabold text-foreground">
            چرا شروع کردیم
          </h2>
          <p className="mt-4 text-sm leading-8 text-muted">
            خرید خدمت محتوایی در بازار فارسی سه درد دارد: قیمت نامعلوم، تعهد نامکتوب و پول
            بی‌صاحب. مشتری نمی‌داند یک خدمت باید چقدر باشد، توافق در پیام‌رسان می‌ماند و پرداخت
            مستقیم ریسک بدحسابی می‌سازد.
          </p>
          <p className="mt-4 text-sm leading-8 text-muted">
            پاسخ ما یک مسیر واحد است: بسته‌ی قیمت‌گذاری‌شده، قرارداد الکترونیکی، کیف پول و
            تسویه. نه یک دایرکتوری که فقط آگهی نشان می‌دهد، نه یک فرم قرارداد که کاری از پیش
            نمی‌برد.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-foreground">چطور کار می‌کنیم</h2>
          <ol className="mt-4 space-y-4">
            {[
              "کارفرما بسته‌ی مناسب را با قیمت و دامنه‌ی تحویل انتخاب می‌کند.",
              "قرارداد الکترونیکی ساخته و امضا می‌شود.",
              "پول در کیف پول می‌ماند تا تحویل تأیید شود.",
              "تسویه با بررسی و تأیید انجام می‌شود.",
            ].map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-navy text-xs font-bold text-white">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm leading-7 text-muted">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mt-16" aria-labelledby="values">
        <h2 id="values" className="text-2xl font-extrabold text-foreground">
          اصولی که کنار نمی‌گذاریم
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((value) => (
            <div key={value.title} className="rounded-2xl border border-border bg-card p-5">
              <h3 className="text-sm font-extrabold text-foreground">{value.title}</h3>
              <p className="mt-2 text-xs leading-6 text-muted">{value.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16" aria-labelledby="team">
        <h2 id="team" className="text-2xl font-extrabold text-foreground">
          تیم
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted">
          شرکت عمداً کوچک است: یک بنیان‌گذار و شش نقش عملیاتی. نقش‌های اجرایی با کارمندان هوش
          مصنوعی و مهارت‌های مکتوب اجرا می‌شوند؛ تصمیم، پول و انتشار عمومی نزد انسان می‌ماند.
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">
          <table className="w-full text-right text-sm">
            <thead className="bg-subtle text-xs text-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">نقش</th>
                <th className="px-4 py-3 font-semibold">تمرکز</th>
              </tr>
            </thead>
            <tbody>
              {TEAM.map((member) => (
                <tr key={member.role} className="border-t border-border">
                  <td className="px-4 py-3 font-semibold text-foreground">{member.role}</td>
                  <td className="px-4 py-3 text-muted">{member.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          شرح کامل هر نقش و مرزهای تصمیم در دفتر شرکت منتشر شده است.
        </p>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-card p-6" aria-labelledby="contact">
        <h2 id="contact" className="text-xl font-extrabold text-foreground">
          تماس
        </h2>
        <div className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted">ایمیل</p>
            <p className="mt-1 font-semibold text-foreground" dir="ltr">
              hello@adminhub21.com
            </p>
          </div>
          <div>
            <p className="text-xs text-muted">پشتیبانی</p>
            <p className="mt-1 font-semibold text-foreground">از داخل حساب، بخش تیکت‌ها</p>
          </div>
          <div>
            <p className="text-xs text-muted">کد و انتشار</p>
            <p className="mt-1 font-semibold text-foreground" dir="ltr">
              github.com/Saeidoscar/Adminhub21
            </p>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link
          href="/roadmap"
          className="rounded-xl bg-navy px-5 py-2.5 text-sm font-bold text-white transition hover:bg-navy-light"
        >
          نقشه‌ی راه
        </Link>
        <Link
          href="/marketplace"
          className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-foreground transition hover:bg-subtle"
        >
          دیدن بازار
        </Link>
      </div>
    </div>
  )
}
