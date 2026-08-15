"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  TbMessageCircle,
  TbSearch,
  TbFileText,
  TbClipboard,
  TbAnalyze,
  TbChartBar,
} from "react-icons/tb"

const services = [
  {
    icon: <TbMessageCircle size={26} />,
    title: "سوال حقوقی",
    desc: "پاسخ به پرسش‌های حقوقی و قضایی شما بر اساس قوانین و مقررات ایران",
    color:
      "from-blue-500/10 to-blue-600/5 border-blue-200 dark:border-blue-900",
    iconColor:
      "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    icon: <TbSearch size={26} />,
    title: "جستجوی قوانین",
    desc: "یافتن قوانین، نظریه‌های مشورتی، آرای صادره و مقررات مرتبط با موضوع حقوقی شما",
    color:
      "from-emerald-500/10 to-emerald-600/5 border-emerald-200 dark:border-emerald-900",
    iconColor:
      "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30",
  },
  {
    icon: <TbFileText size={26} />,
    title: "تنظیم قرارداد",
    desc: "تنظیم قراردادهای حقوقی با در نظر گرفتن تمام جوانب قانونی و منافع طرفین",
    color:
      "from-violet-500/10 to-violet-600/5 border-violet-200 dark:border-violet-900",
    iconColor:
      "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-900/30",
  },
  {
    icon: <TbClipboard size={26} />,
    title: "تنظیم مستند حقوقی",
    desc: "تنظیم انواع مستندات حقوقی با در نظر گرفتن تمام جوانب قانونی",
    color:
      "from-orange-500/10 to-orange-600/5 border-orange-200 dark:border-orange-900",
    iconColor:
      "text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    icon: <TbAnalyze size={26} />,
    title: "تحلیل رای / دادنامه",
    desc: "تحلیل رای دادگاه بر اساس قوانین ایران به کمک برترین مدل استدلالی حقوقی",
    color:
      "from-rose-500/10 to-rose-600/5 border-rose-200 dark:border-rose-900",
    iconColor:
      "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/30",
  },
  {
    icon: <TbChartBar size={26} />,
    title: "پیش‌بینی نتیجه پرونده",
    desc: "پیش‌بینی نتیجه انواع پرونده‌های حقوقی و کیفری با تکیه بر منابع حقوقی موجود",
    color:
      "from-cyan-500/10 to-cyan-600/5 border-cyan-200 dark:border-cyan-900",
    iconColor:
      "text-cyan-600 dark:text-cyan-400 bg-cyan-100 dark:bg-cyan-900/30",
  },
]

const DadbotServices = () => (
  <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-violet-600 dark:text-violet-400 font-medium text-sm mb-3">
          قابلیت‌های دادبات
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          دادبات چه کارهایی می‌تواند انجام دهد؟
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm">
          شش قابلیت اصلی برای پوشش کامل نیازهای حقوقی شما
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((service, i) => (
          <motion.div
            key={service.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.07 }}
            className={`group flex flex-col gap-4 p-6 rounded-2xl border bg-gradient-to-br ${service.color} hover:shadow-md transition-all duration-200 cursor-pointer`}
          >
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${service.iconColor}`}
            >
              {service.icon}
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base mb-2 group-hover:text-primary transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                {service.desc}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="text-center mt-10"
      >
        <Link
          href="/start"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-500/20"
        >
          همین حالا امتحان کنید
        </Link>
      </motion.div>
    </div>
  </section>
)

export default DadbotServices
