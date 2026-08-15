"use client" /* پلتفرم‌ها */

import Link from "next/link"
import { motion } from "framer-motion"
import {
  TbBuildingBank,
  TbArrowLeft,
  TbDownload,
  TbCloud,
} from "react-icons/tb"

const LawOfficeHero = () => (
  <section className="relative overflow-hidden pt-32 pb-20 px-4">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
    </div>
    <div className="max-w-4xl mx-auto text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-400 text-sm font-medium mb-6"
      >
        <TbCloud size={16} />
        نرم‌افزار ابری + هوش مصنوعی
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-4"
      >
        مدیریت دفتر وکالت
        <br />
        <span className="bg-gradient-to-r from-indigo-500 to-primary bg-clip-text text-transparent">
          هوشمند و ابری
        </span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
      >
        دادلاین یک نرم‌افزار تخصصی برای مدیریت دفتر وکالت است که به وکلا کمک
        می‌کند تا پرونده‌ها، موکلین، جلسات، صورت‌حساب‌ها و مستندات را به راحتی و با
        امنیت کامل مدیریت کنند.
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
      >
        <Link
          href="/sign-up"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/25"
        >
          شروع رایگان
          <TbArrowLeft size={18} />
        </Link>
        <Link
          href="#download"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:border-indigo-500 hover:text-indigo-600 transition-all"
        >
          <TbDownload size={18} />
          دانلود نرم‌افزار
        </Link>
      </motion.div>
      {}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400"
      >
        <span>در دسترس برای:</span>
        <span className="font-medium">ویندوز</span>
        <span>•</span>
        <span className="font-medium">اندروید</span>
        <span>•</span>
        <span className="font-medium">iOS</span>
        <span>•</span>
        <span className="font-medium">وب</span>
      </motion.div>
    </div>
  </section>
)

export default LawOfficeHero
