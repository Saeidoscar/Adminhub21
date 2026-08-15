import {
  TbHome2,
  TbFolder,
  TbMessage,
  TbUserCircle,
  TbGridDots,
  TbMessageChatbot,
  TbUsers,
  TbFileDescription,
  TbHelp,
  TbBell,
  TbCreditCard,
  TbSettings,
  TbFileDots,
  TbHeart,
  TbReceipt,
} from "react-icons/tb"

export interface NavItem {
  title: string
  href: string
  icon: any
}

export const publicItems: NavItem[] = [
  {
    title: "خانه",
    href: "/",
    icon: TbHome2,
  },
  {
    title: "دادبات",
    href: "/ai",
    icon: TbMessageChatbot,
  },
  {
    title: "وکلا",
    href: "/lawyer",
    icon: TbUsers,
  },
  {
    title: "پرسش‌ها",
    href: "/questions",
    icon: TbHelp,
  },
]

export const dashboardItems: NavItem[] = [
  {
    title: "پیشخوان",
    href: "/pishkhan",
    icon: TbHome2,
  },
  {
    title: "پرونده‌ها",
    href: "/pishkhan/cases",
    icon: TbFolder,
  },
  {
    title: "گفتگو",
    href: "/pishkhan/messages",
    icon: TbMessage,
  },
  {
    title: "حساب",
    href: "/pishkhan/profile",
    icon: TbUserCircle,
  },
]

export const publicMoreItems: NavItem[] = [
  {
    title: "قرارداد‌آنلاین",
    href: "/contracts",
    icon: TbFileDescription,
  },
  {
    title: "کارشناسان‌حقوقی",
    href: "/expert",
    icon: TbHeart,
  },
  {
    title: "تنظیم‌‌اوراق",
    href: "/legal-documents",
    icon: TbFileDots,
  },
  {
    title: "مستندات‌حقوقی",
    href: "/document",
    icon: TbCreditCard,
  },
  {
    title: "تجربه‌قضایی",
    href: "/story",
    icon: TbCreditCard,
  },
  {
    title: "وبلاگ‌حقوقی",
    href: "/blog",
    icon: TbCreditCard,
  },
  {
    title: "تعرفه‌خدمات",
    href: "/pricing",
    icon: TbReceipt,
  },
  {
    title: "درباره‌ما",
    href: "/about",
    icon: TbBell,
  },
  {
    title: "تماس‌با‌ما",
    href: "/contact",
    icon: TbBell,
  },
]

export const pishkhanMoreItems: NavItem[] = [
  {
    title: "اعلان‌ها",
    href: "/pishkhan/notifications",
    icon: TbBell,
  },
  {
    title: "پرداخت‌ها",
    href: "/pishkhan/payments",
    icon: TbCreditCard,
  },
  {
    title: "علاقه‌مندی",
    href: "/favorites",
    icon: TbHeart,
  },
  {
    title: "تنظیمات",
    href: "/pishkhan/settings",
    icon: TbSettings,
  },
]

export const MoreIcon = TbGridDots
