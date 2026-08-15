"use client"

import { motion } from "framer-motion"
import { TbStar } from "react-icons/tb"

const testimonials = [
  {
    name: "مرتضی شاه محمدی گلبوس",
    type: "کارآموز وکالت",
    rating: 4,
    text: "باسلام و درود به روز رسانی پروفایل بعد انجام اعمال خواسته صورت نمی‌پذیرد. امیدوارم تعامل خوبی برای هر دو سمت صورت پذیرد. سرعت تغییر آپشن‌ها و گزینه‌ها برای مخاطب بالاتر برود.",
  },
  {
    name: "آرش ارشد",
    type: "کارشناس حقوقی",
    rating: 5,
    text: "با نهایت احترام و خرسندی، این دستاورد نوین و خدمت ارزشمند که با زحمات فراوان حاصل شده است، نشان‌دهنده گام‌های بلند و تحولی شگرف در مسیر تحقق اهداف یک نظام قضائی جدید است.",
  },
  {
    name: "سیده رضوان ساعدی",
    type: "وکیل پایه یک کانون وکلای دادگستری",
    rating: 5,
    text: "دادلاین را می‌توان نمونه‌ای قابل اعتنا از یک بستر تخصصی دانست که با درک صحیح از الزامات حرفه حقوق، موفق شده است پیوندی معنادار میان دانش حقوقی، کاربست عملی و مسئولیت اجتماعی برقرار نماید.",
  },
  {
    name: "حمیدرضا مجتهدی فر",
    type: "وکیل پایه یک مرکز وکلای قوه قضاییه",
    rating: 5,
    text: "سلام از اپلیکیشن شما که راهی برای تعامل وکلا با موکلین ایجاد کرده تشکر می‌کنم و از پاسخگویی و پشتیبانی خوب آن که موجب افزایش تعامل موکلین، دسترسی آسان‌تر و رفع مشکلات زیادی از جامعه می‌شود، تشکر می‌نمایم.",
  },
]

const getInitials = (name: string) => {
  const p = name.trim().split(" ")
  return p.length >= 2 ? p[0][0] + p[1][0] : p[0].slice(0, 2)
}

const StartTestimonials = () => (
  <section className="py-20 px-4 bg-gray-50 dark:bg-gray-900/50">
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <p className="text-primary font-medium text-sm mb-3">نظرات متخصصان</p>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          آنچه همکاران می‌گویند
        </h2>
      </motion.div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="flex flex-col gap-4 p-6 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
          >
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <TbStar
                  key={s}
                  size={14}
                  className={
                    s <= t.rating
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4">
              {t.text}
            </p>
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="w-10 h-10 rounded-full bg-linear-to-br from-primary/20 to-blue-500/20 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                {getInitials(t.name)}
              </div>
              <div>
                <div className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {t.type}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
)

export default StartTestimonials
