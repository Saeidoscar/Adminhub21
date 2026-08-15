"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TbArrowLeft, TbScale, TbBuildingBank } from "react-icons/tb"

const StartHero = () => {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 px-4">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>
      <div className="max-w-6xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
        >
          <TbScale size={16} />
          ویژه وکلای پایه‌یک، کارآموزان وکالت، قضات، کارشناسان رسمی و متخصصان
          حقوقی
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
        >
          دادلاین؛ پلتفرم کاربردی
          <br />
          <span className="bg-linear-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
            خدمات حقوقی
          </span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
        >
          دادلاین، زیرساخت هوشمند ارائه خدمات حقوقی برای وکلا و مشاوران متخصص
          است. با پشتیبانی فناوری‌های نوین، خدمات حرفه‌ای خود را با بهره‌وری بیشتر
          ارائه دهید.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
          >
            شروع همکاری
            <TbArrowLeft size={18} />
          </Link>
          <Link
            href="#features"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:border-primary hover:text-primary transition-all"
          >
            <TbBuildingBank size={18} />
            ویژگی‌های دادلاین
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-400 mt-6"
        >
          مجموعه‌ای از نیازمندی‌های حقوقی شما در یک سامانه
        </motion.p>
      </div>
    </section>
  )
}

export default StartHero
