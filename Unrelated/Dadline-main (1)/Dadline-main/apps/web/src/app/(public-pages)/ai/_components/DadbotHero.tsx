"use client" /* هشدار مشاوره وکیل */

import Link from "next/link"
import { motion } from "framer-motion"
import { TbMessageChatbot, TbArrowLeft, TbCoin, TbScale } from "react-icons/tb"

const DadbotHero = () => (
  <section className="relative overflow-hidden pt-32 pb-20 px-4">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
    </div>

    <div className="max-w-6xl mx-auto text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-violet-500 to-blue-600 shadow-lg shadow-violet-500/30 mb-8"
      >
        <TbMessageChatbot size={40} className="text-white" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-violet-600 dark:text-violet-400 font-semibold text-lg mb-2"
      >
        دادبات
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
      >
        سوال حقوقی از
        <span className="bg-linear-to-r from-violet-500 to-blue-500 bg-clip-text text-transparent">
           هوش مصنوعی
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg text-gray-600 dark:text-gray-400 mx-auto leading-relaxed mb-10"
      >
        با استفاده از هوش مصنوعی دادلاین، پاسخ‌های دقیق و کارشناسانه به سوالات
        حقوقی خود دریافت کنید
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
      >
        <Link
          href="/pishkhan/ai"
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/25"
        >
          <TbMessageChatbot size={20} />
          شروع گفتگو با دادبات
          <TbArrowLeft size={18} />
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800"
      >
        <div className="flex items-center gap-2">
          <TbCoin size={20} className="text-violet-600 dark:text-violet-400" />
          <span className="text-2xl font-bold text-violet-700 dark:text-violet-300">
            ۳٬۰۰۰
          </span>
          <span className="text-sm text-violet-600 dark:text-violet-400 font-medium">
            توکن رایگان
          </span>
        </div>
        <div className="w-px h-6 bg-violet-200 dark:bg-violet-700" />
        <span className="text-sm text-gray-600 dark:text-gray-400">
          برای شروع
        </span>
      </motion.div>

      {}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 max-w-2xl mx-auto flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-right"
      >
        <TbScale
          size={18}
          className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5"
        />
        <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
          پاسخ‌های دادبات می‌تواند برای آشنایی اولیه مفید باشد، اما به دلیل اهمیت
          مسائل حقوقی، توصیه می‌شود پرسش خود را مستقیماً با{" "}
          <Link
            href="/lawyer"
            className="font-semibold underline hover:no-underline"
          >
            وکلای پایه یک دادگستری
          </Link>{" "}
          مطرح کنید.
        </p>
      </motion.div>
    </div>
  </section>
)

export default DadbotHero
