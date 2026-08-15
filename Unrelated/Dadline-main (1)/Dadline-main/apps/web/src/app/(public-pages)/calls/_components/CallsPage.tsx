import Faq from "@/components/template/Faq"
import { Suspense } from "react"
import { TbPhone } from "react-icons/tb"
import CallsDirectory, { type CallsSearchParams } from "./CallsDirectory"
import CallsDirectorySkeleton from "./CallsDirectorySkeleton"

const callFaqs = [
  {
    id: "book-phone-consultation",
    q: "چطور مشاوره تلفنی حقوقی رزرو کنم؟",
    a: "با جستجو و استفاده از فیلترهای تخصص و وضعیت آنلاین، مشاور مناسب را انتخاب کنید. سپس وارد صفحه رزرو شوید، زمان و مدت مشاوره را مشخص کنید و مراحل ثبت درخواست را تکمیل کنید.",
  },
  {
    id: "choose-consultant",
    q: "چطور وکیل یا کارشناس مناسب را انتخاب کنم؟",
    a: "تخصص‌های درج‌شده در کارت هر مشاور، امتیاز کاربران، تعداد دیدگاه‌ها، وضعیت آنلاین و هزینه شروع مشاوره را مقایسه کنید. انتخاب فردی که حوزه تخصص او با موضوع پرونده شما مرتبط است، نتیجه بهتری خواهد داشت.",
  },
  {
    id: "consultation-price",
    q: "هزینه مشاوره تلفنی چگونه محاسبه می‌شود؟",
    a: "هزینه بر اساس تعرفه تعیین‌شده توسط هر وکیل یا کارشناس و مدت زمان انتخابی تماس محاسبه می‌شود. مبلغ قابل پرداخت پیش از نهایی‌کردن رزرو به شما نمایش داده خواهد شد.",
  },
  {
    id: "call-duration",
    q: "مدت زمان مشاوره تلفنی چقدر است؟",
    a: "مدت‌های قابل رزرو به تنظیمات خدمات هر مشاور بستگی دارد. هنگام ثبت درخواست می‌توانید گزینه‌های زمانی موجود را مشاهده و مدت متناسب با نیاز خود را انتخاب کنید.",
  },
  {
    id: "prepare-for-call",
    q: "پیش از شروع تماس چه اطلاعاتی آماده کنم؟",
    a: "خلاصه‌ای کوتاه و دقیق از موضوع، پرسش‌های اصلی، تاریخ رویدادهای مهم و مشخصات اسناد مرتبط را آماده کنید. این کار کمک می‌کند زمان تماس به شکل مؤثرتری صرف بررسی مسئله حقوقی شما شود.",
  },
  {
    id: "reschedule-or-cancel",
    q: "آیا امکان لغو یا تغییر زمان مشاوره وجود دارد؟",
    a: "شرایط لغو یا تغییر زمان در فرایند رزرو و متناسب با وضعیت درخواست نمایش داده می‌شود. برای جلوگیری از اختلال در برنامه مشاور، بهتر است درخواست تغییر را در اولین فرصت ثبت کنید.",
  },
]

export default function CallsPage({
  searchParams,
}: {
  searchParams: Promise<CallsSearchParams>
}) {
  return (
    <main className="min-h-screen px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <CallsHero />

        <Suspense fallback={<CallsDirectorySkeleton />}>
          <CallsDirectory searchParams={searchParams} />
        </Suspense>

        <CallsFaq />
      </div>
    </main>
  )
}

function CallsHero() {
  return (
    <header className="mb-8 text-center">
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
        <TbPhone size={16} />
        مشاوره تلفنی حقوقی
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white md:text-4xl">
        مشاوره تلفنی با وکلا و کارشناسان دادلاین
      </h1>
      <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-gray-500 dark:text-gray-400">
        بهترین وکلا و کارشناسان ایران را بر اساس تخصص، عملکرد، تجربه و دیدگاه
        مشتریان جستجو کنید و مناسب‌ترین گزینه را برای رزرو مشاوره تلفنی انتخاب
        نمایید.
      </p>
    </header>
  )
}

function CallsFaq() {
  return (
    <section className="mt-16 border-t border-gray-200 pt-14 dark:border-gray-800">
      <Faq
        faqs={callFaqs}
        title="سؤالات پرتکرار مشاوره تلفنی"
        description="پاسخ پرسش‌های رایج درباره انتخاب مشاور، هزینه و نحوه رزرو تماس حقوقی"
      />
    </section>
  )
}
