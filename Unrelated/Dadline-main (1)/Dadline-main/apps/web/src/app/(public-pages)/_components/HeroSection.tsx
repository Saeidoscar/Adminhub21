"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TbArrowDownDashed, TbScale } from "react-icons/tb"

const HeroSection = () => {
  return (
    <div className="relative">
      <section className="min-h-screen flex flex-col items-center justify-center pt-10 pb-10 px-4 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none select-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10 px-3 pt-10 md:pt-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium"
          >
            <TbScale size={18} />
            عدالت برای همه
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm md:text-xl lg:text-2xl leading-tight text-gray-900 dark:text-white mt-3 md:my-6"
          >
            دستیار هوشمند حقوقی و مشاوره فوری با وکیل پایه یک
          </motion.h2>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="leading-tight dark:text-white mb-4 text-2lx md:text-4xl lg:text-5xl bg-linear-to-r from-primary to-blue-500 bg-clip-text text-transparent"
          >
            سامانه خدمات حقوقی و قضایی دادلاین
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-justify text-lg md:text-xl text-gray-600 dark:text-gray-400 mx-auto leading-relaxed mb-6"
          >
            دادلاین، با خدمات مشاوره حقوقی (تلفنی و متنی)، تنظیم مستندات حقوقی و
            قانونی، بررسی و ارزیابی پرونده‌ها و مدیریت و امضای قراردادهای
            الکترونیکی، به شما این امکان را می‌دهد تا بدون پیچیدگی و یا صرف زمان
            و هزینه زیاد، تمامی نیازهای حقوقی‌تان را با پشتیبانی تیمی از وکلای
            حرفه‌ای و کارشناسان مجرب برطرف کنید. دادلاین دستیار هوشمند خدمات
            حقوقی شماست.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex  sm:flex-row items-center justify-center gap-2 mb-12"
          >
            <a
              href="#services"
              className="inline-flex items-center gap-1 px-4 py-3.5 rounded-xl bg-primary text-white font-semibold text-base hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 hover:shadow-primary/40"
            >
              مشاهده خدمات
              <TbArrowDownDashed size={18} />
            </a>
            <Link
              href="/lawyer"
              className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold text-base hover:border-primary dark:hover:border-primary transition-all"
            >
              مشاهده وکلا
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default HeroSection
