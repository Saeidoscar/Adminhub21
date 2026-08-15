"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { TbArrowLeft, TbScale } from "react-icons/tb"

const StartCTA = () => (
  <section className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-linear-to-l from-primary to-indigo-600 p-10 md:p-16 text-center text-white"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

        <div className="relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 mb-6">
            <TbScale size={32} className="text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            به جمع متخصصین دادلاین بپیوندید
          </h2>
          <p className="text-white/80 mx-auto mb-8 leading-relaxed">
            با ثبت‌نام در پیشرفته‌ترین پلتفرم خدمات حقوقی ایران، حرفه‌ای‌تر فعالیت
            کنید و درآمد خود را افزایش دهید
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary font-bold hover:bg-white/90 transition-all shadow-lg"
            >
              شروع همکاری
              <TbArrowLeft size={18} />
            </Link>
            <p className="text-white/70 text-sm">
              بدون دغدغه زیرساخت، فقط بر تخصص‌تان تمرکز کنید
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
)

export default StartCTA
