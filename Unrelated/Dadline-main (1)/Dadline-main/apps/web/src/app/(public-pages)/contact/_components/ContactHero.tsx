"use client"

import { motion } from "framer-motion"
import { TbHeadset } from "react-icons/tb"

const ContactHero = () => (
  <section className="relative overflow-hidden pt-32 pb-4 px-4">
    <div className="mx-auto text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-8"
      >
        <TbHeadset size={32} className="text-primary" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4"
      >
        تماس با ما
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mx-auto"
      >
        تیم پشتیبانی دادلاین آماده پاسخگویی به سوالات، رفع مشکلات و دریافت
        پیشنهادات شماست.
      </motion.p>
    </div>
  </section>
)

export default ContactHero
