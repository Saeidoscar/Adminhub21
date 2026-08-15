"use client"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TbScale,
  TbFileText,
  TbRobot,
  TbUserSearch,
  TbUsers,
  TbMessageCircle,
  TbBook,
  TbUserHeart,
} from "react-icons/tb"
import Link from "next/link"
import Container from "@/components/shared/Container"

const mainServices = [
  {
    icon: <TbFileText size={28} />,
    title: "ثبت و امضای قرارداد",
    desc: "الکترونیکی، سریع، آنلاین، امن و قانونی",
    href: "/contracts",
  },
  {
    icon: <TbRobot size={28} />,
    title: "ربات حقوقی دادبات",
    desc: "دستیار هوشمند هوش مصنوعی حقوقی",
    href: "/ai",
  },
  {
    icon: <TbUserSearch size={28} />,
    title: "بهترین وکلای پایه یک",
    desc: "در تخصص‌های مختلف از سراسر ایران",
    href: "/lawyer",
  },
  {
    icon: <TbUsers size={28} />,
    title: "بهترین کارشناسان حقوقی",
    desc: "کارشناسان رسمی و فارغ‌التحصیلان حقوقی",
    href: "/expert",
  },
  {
    icon: <TbMessageCircle size={28} />,
    title: "پرسش و پاسخ حقوقی",
    desc: "توسط با تجربه‌ترین وکلا و قضات ایران",
    href: "/questions",
  },
  {
    icon: <TbScale size={28} />,
    title: "مشاوره تلفنی",
    desc: "توسط با تجربه‌ترین وکلا و قضات ایران",
    href: "/calls",
  },
  {
    icon: <TbUserHeart size={28} />,
    title: "وکیل مشاور آنلاین",
    desc: "توسط با تجربه‌ترین وکلا و قضات ایران",
    href: "/my-lawyer",
  },
  {
    icon: <TbBook size={28} />,
    title: "بانک مستندات حقوقی",
    desc: "توسط با تجربه‌ترین وکلا و قضات ایران",
    href: "/document",
  },
]

const ServicesSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section className="pb-8 px-4" id="services">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-primary font-medium text-sm mb-3"
          >
            خدمات قضایی و حقوقی، ساده‌تر از همیشه
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
          >
            خدمات حقوقی، قضایی و هوشمند دادلاین
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="text-gray-500 dark:text-gray-400 mt-3 max-w-xl mx-auto"
          >
            از ثبت و پیگیری امور قضایی تا دریافت خدمات حقوقی تخصصی، دادلاین
            مجموعه‌ای از خدمات غیرحضوری و نیمه‌حضوری را با همراهی وکلای حرفه‌ای در
            اختیار شما قرار می‌دهد؛ سریع، دقیق و بدون پیچیدگی‌های معمول
          </motion.p>
        </div>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {mainServices.map((service, index) => (
              <motion.div
                key={service.href}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  type: "spring",
                  bounce: 0.1,
                  delay: index * 0.1,
                }}
                viewport={{ once: true }}
                className="relative p-4"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <AnimatePresence>
                  {hoveredIndex === index && (
                    <motion.span
                      className="absolute inset-0 h-full w-full bg-gray-100 dark:bg-zinc-800/[0.8] block  rounded-3xl"
                      layoutId="hoverBackground"
                      initial={{ opacity: 0 }}
                      animate={{
                        opacity: 1,
                        transition: { duration: 0.15 },
                      }}
                      exit={{
                        opacity: 0,
                        transition: {
                          duration: 0.15,
                          delay: 0.2,
                        },
                      }}
                    />
                  )}
                </AnimatePresence>
                <Link href={service.href}>
                  <div className="p-4 rounded-2xl z-10 relative bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 h-full group">
                    <div className="flex flex-col">
                      <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-600 group-hover:border-primary">
                        {service.icon}
                      </div>
                      <div className="mt-6">
                        <h2 className="text-xl mb-2 text-primary">
                          {service.title}
                        </h2>
                        <p className="text-muted dark:text-muted-dark">
                          {service.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </Container>
      </div>
    </section>
  )
}

export default ServicesSection
