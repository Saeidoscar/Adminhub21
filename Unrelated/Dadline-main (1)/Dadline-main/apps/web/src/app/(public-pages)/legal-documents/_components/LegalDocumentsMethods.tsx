"use client" /* روش اول: هوش مصنوعی */ /* روش دوم: وکلا */ /* نکات تکمیلی */

import { motion } from "framer-motion"
import Link from "next/link"
import {
  TbRobot,
  TbUsers,
  TbCheck,
  TbArrowLeft,
  TbClock,
  TbCoin,
  TbGavel,
} from "react-icons/tb"

const aiFeatures = [
  "دریافت سند در چند دقیقه",
  "هزینه ثابت و مشخص از ابتدا",
  "تنظیم بر اساس آخرین قوانین و رویه قضایی",
  "امکان بازبینی و اصلاح سریع",
]

const lawyerFeatures = [
  "دریافت چند پیشنهاد از وکلای مختلف",
  "مقایسه قیمت، زمان تحویل و سابقه وکیل",
  "مناسب پرونده‌های پیچیده یا حساس",
  "امکان گفتگوی مستقیم با وکیل بعد از انتخاب",
]

const LegalDocumentsMethods = () => (
  <section
    id="request-from-lawyers"
    className="py-16 px-4 bg-gray-50 dark:bg-gray-900/50"
  >
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-3 flex items-center justify-center gap-1.5">
          <TbGavel size={16} />
          دو روش تنظیم اوراق قضایی در دادلاین
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          حق انتخاب با شماست
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
          بسته به فوریت، بودجه و پیچیدگی پرونده‌تان، یکی از این دو مسیر را انتخاب
          کنید
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl p-7 border border-violet-200 dark:border-violet-900"
        >
          <div className="w-12 h-12 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mb-5">
            <TbRobot
              size={24}
              className="text-violet-600 dark:text-violet-400"
            />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2">
            دادبات — هوش مصنوعی حقوقی
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
            با پاسخ به چند سؤال ساده، هوش مصنوعی دادلاین سند شما را بلافاصله
            تنظیم می‌کند؛ مناسب موارد رایج و زمانی که به سند سریع و اقتصادی نیاز
            دارید.
          </p>
          <ul className="flex flex-col gap-2.5 mb-6 flex-1">
            {aiFeatures.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center shrink-0">
                  <TbCheck
                    size={12}
                    className="text-violet-600 dark:text-violet-400"
                  />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="/pishkhan/ai/legal-documents"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white font-semibold hover:bg-violet-700 transition-colors"
          >
            شروع با دادبات
            <TbArrowLeft size={17} />
          </Link>
        </motion.div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col bg-white dark:bg-gray-900 rounded-2xl p-7 border border-blue-200 dark:border-blue-900"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-5">
            <TbUsers size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-2">
            ثبت درخواست و دریافت پیشنهاد از وکلا
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">
            درخواست تنظیم اوراق قضایی خود را ثبت کنید تا وکلای مختلف با بررسی
            آن، پیشنهاد قیمت و زمان تحویل ارسال کنند؛ شما از میان پیشنهادها
            بهترین گزینه را انتخاب می‌کنید.
          </p>
          <ul className="flex flex-col gap-2.5 mb-6 flex-1">
            {lawyerFeatures.map((f) => (
              <li
                key={f}
                className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                  <TbCheck
                    size={12}
                    className="text-blue-600 dark:text-blue-400"
                  />
                </span>
                {f}
              </li>
            ))}
          </ul>
          <Link
            href="#document-types"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            انتخاب نوع سند و ثبت درخواست
            <TbArrowLeft size={17} />
          </Link>
        </motion.div>
      </div>

      {}
      <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-sm text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-2">
          <TbClock size={16} className="text-gray-400" />
          برای هر دو روش، تحویل سریع
        </span>
        <span className="flex items-center gap-2">
          <TbCoin size={16} className="text-gray-400" />
          پرداخت امن و شفاف
        </span>
      </div>
    </div>
  </section>
)

export default LegalDocumentsMethods
