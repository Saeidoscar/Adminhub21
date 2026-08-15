"use client"

import { motion } from "framer-motion"
import { TbGavel } from "react-icons/tb"

const LegalDocumentsHero = () => (
  <section className="relative overflow-hidden pt-32 pb-16 px-4">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
    </div>

    <div className="max-w-4xl mx-auto text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-300/50 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-sm font-medium mb-8"
      >
        <TbGavel size={16} />
        تنظیم اوراق قضایی دادلاین
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
      >
        تنظیم دقیق، سریع و هوشمند
        <br />
        <span className="text-4xl md:text-5xl lg:text-6xl bg-linear-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
          اوراق قضایی و اسناد حقوقی
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
      >
        تنظیم اوراق قضایی به‌صورت آنلاین در دادلاین از دو روش امکان‌پذیر است. در
        روش اول، با استفاده از هوش مصنوعی حقوقی دادبات می‌توانید متن اوراق قضایی
        را به‌صورت آنی و با دقت بالا دریافت کنید. در روش دوم، درخواست تنظیم اوراق
        قضایی خود را ثبت می‌کنید تا وکلای متخصص پیشنهاد قیمت ارسال کنند و سپس با
        مقایسه هزینه، سوابق و شرایط، بهترین وکیل را برای تنظیم اوراق قضایی
        انتخاب کنید.
      </motion.p>
    </div>
  </section>
)

export default LegalDocumentsHero
