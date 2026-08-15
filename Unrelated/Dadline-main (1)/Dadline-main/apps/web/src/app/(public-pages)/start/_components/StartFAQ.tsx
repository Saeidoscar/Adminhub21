"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { TbChevronDown } from "react-icons/tb"

const faqs = [
  {
    q: "هزینه عضویت در دادلاین چقدر است؟",
    a: "عضویت در دادلاین برای متخصصان حقوقی رایگان است. پس از ثبت‌نام و احراز هویت می‌توانید بلافاصله شروع به ارائه خدمات کنید.",
  },
  {
    q: "میزان پورسانت همکاری و ارائه خدمات چقدر است؟",
    a: "میزان پورسانت بر اساس نوع خدمات و میزان فعالیت متفاوت است. جزئیات کامل پس از ثبت‌نام در اختیار شما قرار می‌گیرد.",
  },
  {
    q: "چه کسانی امکان ثبت‌نام به عنوان متخصص دارند؟",
    a: "وکلای پایه یک دادگستری، قضات بازنشسته، کارشناسان رسمی دادگستری و کلیه متخصصان حقوقی با مدرک معتبر می‌توانند ثبت‌نام کنند.",
  },
  {
    q: "نحوه واریزی‌ها و تسویه حساب چگونه است؟",
    a: "تسویه حساب به صورت دوره‌ای و از طریق حساب بانکی ثبت‌شده انجام می‌شود. امکان مشاهده گزارش‌های مالی در پنل کاربری وجود دارد.",
  },
  {
    q: "با ثبت‌نام، به تمامی خدمات دادلاین دسترسی دارم؟",
    a: "بله، پس از احراز هویت موفق، به تمامی ابزارها و خدمات پلتفرم شامل مدیریت پرونده، قرارداد آنلاین، هوش مصنوعی و فروشگاه دسترسی خواهید داشت.",
  },
  {
    q: "با ثبت‌نام دسترسی به هوش مصنوعی دادبات دارم؟",
    a: "بله، متخصصان ثبت‌نام‌شده به دادبات با امکانات گسترده‌تر و توکن بیشتر نسبت به کاربران عادی دسترسی دارند.",
  },
  {
    q: "آیا امکان واگذاری کارهای وکالت به سایر همکاران وجود دارد؟",
    a: "بله، دادلاین امکان ارجاع پرونده و همکاری با سایر متخصصان پلتفرم را فراهم می‌کند.",
  },
  {
    q: "روش‌های درآمدی در سامانه دادلاین شامل چه مواردی است؟",
    a: "مشاوره تلفنی، مشاوره متنی، ارزیابی پرونده، تنظیم مستندات حقوقی، فروش محصولات در فروشگاه و اشتراک مشاوره از جمله منابع درآمدی هستند.",
  },
]

const FAQItem = ({ q, a }: { q: string a: string }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 text-right hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
      >
        <span className="font-medium text-gray-900 dark:text-white text-sm">
          {q}
        </span>
        <TbChevronDown
          size={18}
          className={`text-gray-400 flex-shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-gray-800 pt-4">
              {a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const StartFAQ = () => (
  <section id="questions" className="py-20 px-4">
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          سوالات متداول
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          پاسخ سوالات رایج درباره همکاری با دادلاین
        </p>
      </motion.div>
      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: i * 0.04 }}
          >
            <FAQItem q={faq.q} a={faq.a} />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

export default StartFAQ
