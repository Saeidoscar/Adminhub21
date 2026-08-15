import type { Metadata } from "next"

const pageMeta: Metadata = {
  title: {
    default: "پنل مدیریت دادلاین",
    template: "%s | مدیریت دادلاین",
  },
  description: "داشبورد امن مدیریت مالی، کاربران و عملیات سامانه حقوقی دادلاین",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
  icons: { icon: "/favicon.ico" },
}

export default pageMeta
