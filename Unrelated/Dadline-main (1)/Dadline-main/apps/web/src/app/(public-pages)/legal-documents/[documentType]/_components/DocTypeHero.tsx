"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { TbRobot, TbUsers, TbArrowLeft } from "react-icons/tb"
import type { DocTypeContent } from "../../_data/legal-documents"

const DocTypeHero = ({ data }: { data: DocTypeContent }) => (
  <section className="relative overflow-hidden pt-32 pb-16 px-4">
    <div className="absolute inset-0 pointer-events-none">
      <div
        className={`absolute top-1/4 right-1/3 w-96 h-96 ${data.color.bg} rounded-full blur-3xl opacity-40`}
      />
    </div>

    <div className="max-w-4xl mx-auto text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-medium mb-6 ${data.color.border} ${data.color.bg} ${data.color.text}`}
      >
        {data.tagline}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6"
      >
        {data.title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-base md:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10"
      >
        {data.heroDescription}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <Link
          href={`/pishkhan/ai/${data.slug}`}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/25"
        >
          <TbRobot size={18} />
          شروع با دادبات
        </Link>
        <Link
          href={`/pishkhan/legal-documents/${data.slug}`}
          className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-semibold hover:border-blue-500 hover:text-blue-600 transition-all"
        >
          <TbUsers size={18} />
          ثبت درخواست و دریافت پیشنهاد
          <TbArrowLeft size={16} />
        </Link>
      </motion.div>
    </div>
  </section>
)

export default DocTypeHero
