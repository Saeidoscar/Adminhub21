"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TbUserPlus, TbFileCheck, TbRocket, TbArrowLeft } from "react-icons/tb"

const steps = [
  {
    number: "۱",
    icon: <TbUserPlus size={28} />,
    title: "ثبت نام در دادلاین",
    desc: "برای استفاده از خدمات مختلف دادلاین، ابتدا با شماره موبایل معتبر ثبت‌نام کنید",
    cta: "ثبت نام سریع",
    href: "/sign-up",
    color: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    number: "۲",
    icon: <TbFileCheck size={28} />,
    title: "درخواست همکاری",
    desc: "پس از ثبت‌نام موفق، درخواست همکاری به عنوان وکیل پایه یک یا سایر متخصصان را ثبت کنید",
    cta: "ثبت درخواست",
    href: "/sign-up",
    color:
      "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
  },
  {
    number: "۳",
    icon: <TbRocket size={28} />,
    title: "فعال‌سازی نرم‌افزار",
    desc: "پس از تأیید درخواست همکاری، در کمتر از ۱ دقیقه نرم‌افزار دفتر وکالت را فعال کنید",
    cta: "شروع و فعال‌سازی",
    href: "/sign-up",
    color:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  },
]

const LawOfficeSteps = () => (
  <section className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-3">
          فعال‌سازی و دریافت نرم‌افزار
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          فقط در ۳ گام
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          همین حالا با ثبت‌نام در دادلاین، نرم‌افزار مدیریت دفتر وکالت را دریافت
          کنید
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="relative flex flex-col items-center text-center p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
          >
            <div className="absolute -top-4 right-1/2 translate-x-1/2 w-8 h-8 rounded-full bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 shadow">
              {step.number}
            </div>
            <div
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 mt-4 ${step.color}`}
            >
              {step.icon}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white text-base mb-3">
              {step.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
              {step.desc}
            </p>
            <Link
              href={step.href}
              className="inline-flex items-center gap-1.5 text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              {step.cta}
              <TbArrowLeft size={15} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

export default LawOfficeSteps
