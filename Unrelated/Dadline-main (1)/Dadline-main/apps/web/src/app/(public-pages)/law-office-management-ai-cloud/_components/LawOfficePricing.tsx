"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TbCheck, TbArrowLeft } from "react-icons/tb"

const plans = [
  {
    name: "اشتراک پایه",
    price: "رایگان",
    period: "برای همیشه",
    highlight: false,
    features: [
      "۱ پرونده فعال همزمان",
      "۳٬۰۰۰ توکن هدیه ثبت‌نام",
      "دسترسی محدود به AI",
      "تسویه حساب ماهانه",
      "کلیه امکانات نرم‌افزار",
    ],
    cta: "شروع رایگان",
    href: "/sign-up",
  },
  {
    name: "اشتراک ویژه",
    price: "۳۰۰ هزار تومان",
    period: "ماهانه + ۱۰٪ ارزش‌افزوده",
    highlight: true,
    badge: "۱۴ روز رایگان",
    features: [
      "نامحدود پرونده فعال همزمان",
      "۲۵٬۰۰۰ توکن هدیه",
      "دسترسی نامحدود به AI",
      "تسویه حساب روزانه",
      "کلیه امکانات نرم‌افزار",
    ],
    cta: "شروع با ۱۴ روز رایگان",
    href: "/sign-up",
  },
]

const LawOfficePricing = () => (
  <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm mb-3">
          قیمت‌گذاری
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          پلن مناسب خود را انتخاب کنید
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
          کلیه امکانات نرم‌افزار ابری مدیریت دفتر وکالت برای هر دو اشتراک فعال
          است و هیچ‌گونه محدودیتی غیر از موارد فوق وجود ندارد 😉
        </p>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className={`relative flex flex-col p-7 rounded-2xl border ${
              plan.highlight
                ? "border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
            }`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-emerald-500 text-white text-xs font-bold shadow">
                {plan.badge}
              </div>
            )}
            <div className="mb-6">
              <h3
                className={`font-bold text-lg mb-2 ${
                  plan.highlight
                    ? "text-white"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {plan.name}
              </h3>
              <div
                className={`text-3xl font-bold mb-1 ${
                  plan.highlight
                    ? "text-white"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {plan.price}
              </div>
              <div
                className={`text-sm ${
                  plan.highlight
                    ? "text-white/70"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {plan.period}
              </div>
            </div>
            <ul className="flex flex-col gap-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <TbCheck
                    size={16}
                    className={
                      plan.highlight ? "text-emerald-300" : "text-emerald-500"
                    }
                  />
                  <span
                    className={`text-sm ${
                      plan.highlight
                        ? "text-white/90"
                        : "text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {f}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              href={plan.href}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl font-semibold transition-colors ${
                plan.highlight
                  ? "bg-white text-indigo-600 hover:bg-white/90"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {plan.cta}
              <TbArrowLeft size={16} />
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

export default LawOfficePricing
