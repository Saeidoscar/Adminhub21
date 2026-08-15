"use client"

import Link from "next/link"
import Image from "next/image"
import { TbArrowUpLeft } from "react-icons/tb"
import badgeWebApp from "./../../../../public/img/badge/badge-web-app.png"
import badgeCafeBazar from "./../../../../public/img/badge/cafe-bazar.png"
import badgeDaneshBonyan from "./../../../../public/img/licences/danesh-bonyan.png"
import badgeEnamad from "./../../../../public/img/licences/enamad.png"
import badgeKasbKar from "./../../../../public/img/licences/kasb-kar.png"
import badgkhalagh from "./../../../../public/img/licences/khalagh.png"

const serviceLinks = [
  {
    title: "خدمات قضایی آنلاین",
    description: "انجام امور قضایی، رسمی و مرحله‌به‌مرحله",
    href: "/judicial-services",
  },
  {
    title: "مشاوره با وکیل",
    description: "دریافت مشاوره تلفنی از وکلای دادلاین",
    href: "/calls",
  },
  {
    title: "تنظیم اوراق قضایی",
    description: "تنظیم دادخواست، شکواییه، لایحه و اظهارنامه",
    href: "/legal-documents",
  },
  {
    title: "قراردادهای آنلاین",
    description: "تنظیم، مدیریت و امضای قراردادهای الکترونیکی",
    href: "/contracts",
  },
  {
    title: "هوش مصنوعی دادبات",
    description: "دریافت راهنمای اولیه برای مسائل حقوقی",
    href: "/ai",
  },
  {
    title: "اشتراک وکیل مشاور",
    description: "همراهی حقوقی مستمر برای اشخاص و کسب‌وکارها",
    href: "/my-lawyer",
  },
  {
    title: "پرسش‌های حقوقی",
    description: "مطالعه پرسش‌ها و پاسخ وکلا و کارشناسان",
    href: "/questions",
  },
  {
    title: "بانک مستندات حقوقی",
    description: "دسترسی به نمونه اسناد و محتوای کاربردی حقوقی",
    href: "/document",
  },
  {
    title: "بررسی و ارزیابی پرونده",
    description: "بررسی یا ارزیابی پیش از اقدام پرونده قضایی",
    href: "/case",
  },
]

const secondaryLinks = [
  { title: "تجربه‌های قضایی", href: "/story" },
  { title: "وبلاگ حقوقی", href: "/blog" },
  {
    title: "مدیریت دفتر وکالت",
    href: "/law-office-management-ai-cloud",
  },
  { title: "تعرفه خدمات", href: "/pricing" },
  { title: "قوانین و مقررات", href: "/terms" },
  { title: "تماس با ما", href: "/contact" },
]

const dadlineCert = [
  {
    alt: "مجوز دانش‌بنیان دادلاین",
    src: badgeDaneshBonyan,
    href: "/about",
  },
  {
    alt: "نماد اعتماد الکترونیکی دادلاین",
    src: badgeEnamad,
    href: "/about",
  },
  {
    alt: "مجوز شرکت خلاق دادلاین",
    src: badgkhalagh,
    href: "/about",
  },
  {
    alt: "مجوز اتحادیه کشوری کسب‌وکارهای مجازی دادلاین",
    src: badgeKasbKar,
    href: "/about",
  },
]

const socialLinks = [
  {
    name: "اینستاگرام",
    href: "https://instagram.com/dadline",
    icon: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    name: "تلگرام",
    href: "https://t.me/dadline",
    icon: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
  },
  {
    name: "لینکدین",
    href: "https://linkedin.com/company/dadline",
    icon: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    name: "ایکس",
    href: "https://twitter.com/dadline",
    icon: (
      <svg className="size-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
]

const DadlineFooter = () => {
  const year = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(
    new Date(),
  )

  return (
    <footer className="border-t border-gray-200 bg-white px-4 text-right dark:border-gray-800 dark:bg-gray-950">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 py-6 lg:grid-cols-4 lg:gap-12 lg:py-8">
          <div className="lg:col-span-1">
            <span className="mb-3 block text-xs font-bold tracking-wide text-primary">
              زیرساخت یکپارچه خدمات حقوقی
            </span>
            <h3 className="mb-3 text-base font-black text-gray-950 dark:text-white">
              سامانه خدمات حقوقی و قضایی دادلاین
            </h3>
            <p className="text-sm leading-7 text-gray-600 dark:text-gray-400 text-justify">
              دادلاین زیرساخت یکپارچه دریافت خدمات حقوقی و قضایی، مشاوره با
              وکیل، تنظیم مستندات و مدیریت قراردادهای الکترونیکی است؛ با تمرکز
              بر دسترسی ساده، امنیت اطلاعات و ارائه خدمات حرفه‌ای.
            </p>
            <div className="grid grid-cols-4 gap-2 border-gray-200 pt-4 dark:border-gray-800">
              {dadlineCert.map((cert) => (
                <Link
                  key={cert.alt}
                  href={cert.href}
                  className="flex min-h-20 items-center justify-center opacity-80 grayscale transition hover:opacity-100 hover:grayscale-0"
                >
                  <Image
                    src={cert.src}
                    width={96}
                    height={112}
                    alt={cert.alt}
                    placeholder="blur"
                    className="h-auto max-h-18 w-auto max-w-full object-contain"
                  />
                </Link>
              ))}
            </div>
          </div>

          <nav aria-label="خدمات دادلاین" className="lg:col-span-3">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-primary">
                  راهنمای خدمات
                </span>
                <h6 className="mt-1 font-bold text-gray-950 dark:text-white">
                  خدمات حقوقی و قضایی پرکاربرد دادلاین
                </h6>
              </div>
            </div>

            <div className="grid sm:grid-cols-3 dark:border-gray-800 rounded-lg">
              {serviceLinks.map((link, index) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`group grid min-h-20 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-none border-gray-100 py-2 transition-colors hover:bg-gray-50/70 dark:border-gray-800 dark:hover:bg-gray-900/50 sm:px-4 `}
                >
                  <span className="min-w-0">
                    <strong className="block text-sm font-bold text-gray-900 transition-colors group-hover:text-primary dark:text-white">
                      {link.title}
                    </strong>
                    <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                      {link.description}
                    </span>
                  </span>
                  <TbArrowUpLeft
                    aria-hidden
                    className="shrink-0 text-lg text-gray-300 transition group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary dark:text-gray-700"
                  />
                </Link>
              ))}
            </div>
          </nav>
        </div>

        <div className="border-t border-gray-200 py-2 dark:border-gray-800">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <nav
              aria-label="اطلاعات و دسترسی‌های سازمانی"
              className="flex flex-wrap items-center gap-x-4 gap-y-2"
            >
              {secondaryLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-xs font-medium text-gray-500 transition-colors hover:text-primary dark:text-gray-400"
                >
                  {link.title}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="flex size-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-primary dark:text-gray-400 dark:hover:bg-gray-900"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center mt-2">
            <p className="flex-fill text-xs leading-6 text-gray-500 dark:border-gray-900 dark:text-gray-500">
              {year} © تمامی حقوق مادی و معنوی متعلق به شرکت دانش‌بنیان توسعه
              تجارت کارزاد است.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <a
                href="https://cafebazaar.ir/app/net.dadline.app"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="دریافت اپلیکیشن دادلاین از کافه بازار"
                className="block"
              >
                <Image
                  src={badgeCafeBazar}
                  width={100}
                  height={15}
                  placeholder="blur"
                  alt="دریافت اپلیکیشن دادلاین از کافه بازار"
                  className="h-auto w-full rounded-md transition-opacity hover:opacity-80"
                />
              </a>
              <Link
                href="/app"
                aria-label="دریافت وب‌اپلیکیشن دادلاین"
                className="block"
              >
                <Image
                  src={badgeWebApp}
                  width={100}
                  height={15}
                  placeholder="blur"
                  alt="دریافت وب‌اپلیکیشن دادلاین"
                  className="h-auto w-full rounded-md transition-opacity hover:opacity-80"
                />
              </Link>
            </div>
          </div>
        </div>

        <div className="h-16 md:hidden" />
      </div>
    </footer>
  )
}

export default DadlineFooter
