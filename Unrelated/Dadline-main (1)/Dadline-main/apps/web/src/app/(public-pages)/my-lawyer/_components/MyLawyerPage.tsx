import Faq from "@/components/template/Faq"
import Link from "next/link"
import { Suspense, type ReactNode } from "react"
import {
  TbArrowLeft,
  TbCheck,
  TbClock,
  TbCoin,
  TbMessageCircle,
  TbPhone,
  TbUserHeart,
} from "react-icons/tb"
import MyLawyerDirectory, {
  type MyLawyerSearchParams,
} from "./MyLawyerDirectory"
import MyLawyerDirectorySkeleton from "./MyLawyerDirectorySkeleton"

const faqs = [
  {
    id: 1,
    q: "وکیل آنلاین چیست؟",
    a: "وکیل آنلاین یا سرویس وکیل مشاور دادلاین خدمتی است که به شما امکان می‌دهد وکیل یا کارشناس حقوقی موردنظر خود را انتخاب کرده و به‌صورت اختصاصی از خدمات او استفاده کنید.",
  },
  {
    id: 2,
    q: "دادکوین چیست؟",
    a: "خدمات وکیل مشاور با واحدی به نام دادکوین قابل دریافت است. قیمت هر واحد دادکوین توسط ارائه‌دهنده تعیین می‌شود و در صورت نیاز می‌توانید اعتبار اشتراک خود را افزایش دهید.",
  },
  {
    id: 3,
    q: "اشتراک وکیل را چطور فعال کنم؟",
    a: "از فهرست ارائه‌دهندگان، وکیل یا کارشناس موردنظر را انتخاب کنید. سپس در صفحه خرید، جزئیات و هزینه اشتراک را بررسی کرده و مراحل فعال‌سازی را تکمیل کنید.",
  },
  {
    id: 4,
    q: "نحوه مصرف دادکوین چگونه است؟",
    a: "اعتبار خریداری‌شده را می‌توانید مطابق شرایط سرویس ارائه‌دهنده برای خدماتی مانند پرسش و پاسخ متنی یا مشاوره تلفنی مصرف کنید. میزان مصرف هر خدمت پیش از ثبت درخواست نمایش داده می‌شود.",
  },
  {
    id: 5,
    q: "امکان تمدید اشتراک وکیل آنلاین وجود دارد؟",
    a: "بله، در صورت نیاز می‌توانید اشتراک یا اعتبار دادکوین خود را مطابق تعرفه و شرایط ارائه‌دهنده تمدید یا شارژ کنید.",
  },
  {
    id: 6,
    q: "بعد از خرید اشتراک وکیل آنلاین چه کاری باید انجام دهم؟",
    a: "پس از پرداخت و فعال‌شدن اشتراک، از پنل کاربری می‌توانید خدمات قابل ارائه و میزان اعتبار خود را مشاهده کرده و درخواست حقوقی موردنظر را برای وکیل یا کارشناس منتخب ثبت کنید.",
  },
]

const serviceFeatures = [
  { icon: <TbClock size={15} />, text: "اشتراک آنلاین" },
  { icon: <TbMessageCircle size={15} />, text: "مشاوره متنی" },
  { icon: <TbPhone size={15} />, text: "مشاوره تلفنی" },
  { icon: <TbCoin size={15} />, text: "پرداخت با دادکوین" },
]

const dadcoinItems = [
  {
    icon: <TbCoin size={22} className="text-amber-500" />,
    title: "دادکوین چیست؟",
    description:
      "واحد اعتباری دادلاین برای دریافت خدمات وکیل مشاور است و تعرفه آن توسط هر ارائه‌دهنده مشخص می‌شود.",
  },
  {
    icon: <TbCheck size={22} className="text-emerald-500" />,
    title: "نحوه مصرف",
    description:
      "اعتبار شما بر اساس نوع و میزان استفاده از خدمات متنی یا تلفنی و مطابق تعرفه مشاور مصرف می‌شود.",
  },
  {
    icon: <TbUserHeart size={22} className="text-primary-deep" />,
    title: "تمدید اشتراک",
    description:
      "در صورت نیاز می‌توانید اعتبار خود را دوباره شارژ کرده و اشتراک وکیل یا کارشناس منتخب را ادامه دهید.",
  },
]

export default function MyLawyerPage({
  searchParams,
}: {
  searchParams: Promise<MyLawyerSearchParams>
}) {
  return (
    <main className="min-h-screen px-4 pb-16 pt-24">
      <div className="mx-auto max-w-7xl">
        <MyLawyerHero />
        <DadcoinIntroduction />

        <div id="providers" className="scroll-mt-24">
          <Suspense fallback={<MyLawyerDirectorySkeleton />}>
            <MyLawyerDirectory searchParams={searchParams} />
          </Suspense>
        </div>

        <section className="mt-16 border-t border-gray-200 pt-14 dark:border-gray-800">
          <Faq
            faqs={faqs}
            description="آنچه باید درباره اشتراک وکیل مشاور بدانید"
          />
        </section>
      </div>
    </main>
  )
}

function MyLawyerHero() {
  return (
    <header className="mb-12 text-center">
      <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary px-4 py-1.5 text-sm font-medium">
        <TbUserHeart size={16} />
        وکیل مشاور آنلاین اختصاصی
      </div>
      <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 dark:text-white md:text-4xl lg:text-5xl">
        وکیل آنلاین یا مشاور حقوقی بگیرید
      </h1>
      <p className="mx-auto mb-8 max-w-xl text-sm leading-7 text-gray-500 dark:text-gray-400">
        با سرویس «وکیل مشاور» دادلاین، ارائه‌دهنده مناسب را بر اساس تخصص، شهر،
        امتیاز و وضعیت آنلاین انتخاب کنید و اشتراک اختصاصی خود را فعال نمایید.
      </p>

      <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
        {serviceFeatures.map((feature) => (
          <span
            key={feature.text}
            className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          >
            {feature.icon}
            {feature.text}
          </span>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="#providers"
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-3 font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-deep"
        >
          انتخاب وکیل اختصاصی
          <TbArrowLeft size={17} />
        </Link>
        <Link
          href="#dadcoin"
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-7 py-3 text-sm font-medium text-gray-600 transition hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-400"
        >
          <TbCoin size={17} />
          دادکوین چیست؟
        </Link>
      </div>
    </header>
  )
}

function DadcoinIntroduction() {
  return (
    <section
      id="dadcoin"
      className="mb-10 grid scroll-mt-28 grid-cols-1 gap-4 md:grid-cols-3"
      aria-label="راهنمای دادکوین"
    >
      {dadcoinItems.map((item) => (
        <InfoCard key={item.title} icon={item.icon} title={item.title}>
          {item.description}
        </InfoCard>
      ))}
    </section>
  )
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: ReactNode
  title: string
  children: ReactNode
}) {
  return (
    <article className="flex items-start gap-3 rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-800">
        {icon}
      </div>
      <div>
        <h2 className="mb-1 text-sm font-bold text-gray-900 dark:text-white">
          {title}
        </h2>
        <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
          {children}
        </p>
      </div>
    </article>
  )
}
