import type { PlatformKey, PlatformConfig } from "@adminhub/shared"

export interface PlatformLabel {
  en: string
  fa: string
}

export interface PlatformField {
  id: string
  label: PlatformLabel
  type: "number" | "boolean" | "text"
  unit?: string
  default?: string | number | boolean
  min?: number
  max?: number
  description?: PlatformLabel
}

export interface PlatformSpec {
  key: PlatformKey
  label: PlatformLabel
  colorClass: string
  iconName: string
  description: PlatformLabel
  fields: PlatformField[]
}

export const PLATFORM_SPECS: Record<PlatformKey, PlatformSpec> = {
  instagram: {
    key: "instagram",
    label: { en: "Instagram", fa: "اینستاگرام" },
    colorClass: "bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888]",
    iconName: "instagram",
    description: {
      en: "Reels, stories, posts, DMs & ad management",
      fa: "ریلز، استوری، پست، DM و مدیریت تبلیغات",
    },
    fields: [
      {
        id: "postsPerMonth",
        label: { en: "Posts / month", fa: "پست/ماه" },
        type: "number",
        unit: "/month",
        default: 30,
        min: 0,
      },
      {
        id: "storiesPerMonth",
        label: { en: "Stories / month", fa: "استوری/ماه" },
        type: "number",
        unit: "/month",
        default: 30,
        min: 0,
      },
      {
        id: "reelsPerMonth",
        label: { en: "Reels / month", fa: "ریل/ماه" },
        type: "number",
        unit: "/month",
        default: 12,
        min: 0,
      },
      {
        id: "dmResponse",
        label: { en: "DM response", fa: "پاسخ به DM" },
        type: "boolean",
        default: true,
        description: {
          en: "Respond to direct messages within 24h",
          fa: "پاسخ به پیام‌های مستقیم در عرض ۲۴ ساعت",
        },
      },
      {
        id: "commentReplies",
        label: { en: "Comment replies", fa: "پاسخ به کامنت" },
        type: "boolean",
        default: true,
      },
      {
        id: "analyticsReport",
        label: { en: "Analytics reports", fa: "گزارش آنالیتیکس" },
        type: "boolean",
        default: true,
      },
      {
        id: "adManagement",
        label: { en: "Ad management", fa: "مدیریت تبلیغات" },
        type: "boolean",
        default: false,
      },
    ],
  },
  telegram: {
    key: "telegram",
    label: { en: "Telegram", fa: "تلگرام" },
    colorClass: "bg-[#229ED9]",
    iconName: "telegram",
    description: {
      en: "Channel posts, bots, groups & engagement campaigns",
      fa: "پست‌های کانال، ربات و کمپین‌های تعامل",
    },
    fields: [
      {
        id: "channelPostsPerMonth",
        label: { en: "Channel posts / month", fa: "پست کانال/ماه" },
        type: "number",
        unit: "/month",
        default: 30,
        min: 0,
      },
      {
        id: "storyPostsPerMonth",
        label: { en: "Stories / month", fa: "استوری/ماه" },
        type: "number",
        unit: "/month",
        default: 15,
        min: 0,
      },
      {
        id: "dmGroupResponse",
        label: { en: "DM / group response", fa: "پاسخ به DM/گروه" },
        type: "boolean",
        default: true,
        description: {
          en: "Respond within 12 hours",
          fa: "پاسخ در عرض ۱۲ ساعت",
        },
      },
      {
        id: "engagementCampaigns",
        label: { en: "Engagement campaigns", fa: "کمپین تعامل" },
        type: "boolean",
        default: true,
      },
      {
        id: "botSetup",
        label: { en: "Bot setup", fa: "راه‌اندازی ربات" },
        type: "boolean",
        default: false,
      },
      {
        id: "analyticsReport",
        label: { en: "Analytics reports", fa: "گزارش آنالیتیکس" },
        type: "boolean",
        default: true,
      },
    ],
  },
  whatsapp: {
    key: "whatsapp",
    label: { en: "WhatsApp", fa: "واتساپ" },
    colorClass: "bg-[#25D366]",
    iconName: "whatsapp",
    description: {
      en: "Catalog, broadcasts, automated replies & labels",
      fa: "کاتالوگ، ارسال‌های گروهی، پاسخ خودکار",
    },
    fields: [
      {
        id: "catalogItems",
        label: { en: "Catalog items", fa: "آیتم‌های کاتالوگ" },
        type: "number",
        unit: "",
        default: 50,
        min: 0,
      },
      {
        id: "broadcastsPerWeek",
        label: { en: "Broadcasts / week", fa: "ارسال/هفته" },
        type: "number",
        unit: "/week",
        default: 4,
        min: 0,
      },
      {
        id: "automatedReplies",
        label: { en: "Automated replies", fa: "پاسخ‌های خودکار" },
        type: "boolean",
        default: true,
      },
      {
        id: "labels",
        label: { en: "Labels & segmentation", fa: "برچسب‌ها و بخش‌بندی" },
        type: "boolean",
        default: true,
      },
      {
        id: "quickReplies",
        label: { en: "Quick replies", fa: "پاسخ‌های سریع" },
        type: "boolean",
        default: true,
      },
    ],
  },
  torob: {
    key: "torob",
    label: { en: "Torob", fa: "ترب" },
    colorClass: "bg-[#e53935]",
    iconName: "torob",
    description: {
      en: "Product listings, pricing & SEO optimization",
      fa: "لیست محصول، قیمت و بهینه‌سازی سئو",
    },
    fields: [
      {
        id: "productListings",
        label: { en: "Product listings", fa: "لیست محصول" },
        type: "number",
        unit: "",
        default: 100,
        min: 0,
      },
      {
        id: "pricingUpdates",
        label: { en: "Dynamic pricing", fa: "قیمت‌گذاری پویا" },
        type: "boolean",
        default: true,
      },
      {
        id: "inventorySync",
        label: { en: "Inventory sync", fa: "همگام‌سازی موجودی" },
        type: "boolean",
        default: true,
      },
      {
        id: "seoOptimization",
        label: { en: "SEO optimization", fa: "بهینه‌سازی سئو" },
        type: "boolean",
        default: true,
      },
      {
        id: "torobAds",
        label: { en: "Torob ads", fa: "تبلیغات ترب" },
        type: "boolean",
        default: false,
      },
    ],
  },
  digikala: {
    key: "digikala",
    label: { en: "Digikala", fa: "دیجی‌کالا" },
    colorClass: "bg-[#ee1b24]",
    iconName: "digikala",
    description: {
      en: "Product listings, pricing strategy & ads",
      fa: "لیست محصول، استراتژی قیمت و تبلیغات",
    },
    fields: [
      {
        id: "productListings",
        label: { en: "Product listings", fa: "لیست محصول" },
        type: "number",
        unit: "",
        default: 100,
        min: 0,
      },
      {
        id: "pricingStrategy",
        label: { en: "Pricing strategy", fa: "استراتژی قیمت‌گذاری" },
        type: "boolean",
        default: true,
      },
      {
        id: "inventoryMgmt",
        label: { en: "Inventory management", fa: "مدیریت موجودی" },
        type: "boolean",
        default: true,
      },
      {
        id: "digikalaAds",
        label: { en: "Digikala ads", fa: "تبلیغات دیجی‌کالا" },
        type: "boolean",
        default: false,
      },
      {
        id: "analyticsReport",
        label: { en: "Analytics reports", fa: "گزارش آنالیتیکس" },
        type: "boolean",
        default: true,
      },
    ],
  },
  linkedin: {
    key: "linkedin",
    label: { en: "LinkedIn", fa: "لینکدین" },
    colorClass: "bg-[#0077b5]",
    iconName: "linkedin",
    description: {
      en: "B2B content, lead generation & articles",
      fa: "محتوا B2B، تولید لید و مقالات",
    },
    fields: [
      {
        id: "postsPerMonth",
        label: { en: "Posts / month", fa: "پست/ماه" },
        type: "number",
        unit: "/month",
        default: 8,
        min: 0,
      },
      {
        id: "articlePublishing",
        label: { en: "Articles / month", fa: "مقاله/ماه" },
        type: "number",
        unit: "/month",
        default: 2,
        min: 0,
      },
      {
        id: "leadGeneration",
        label: { en: "Lead generation", fa: "تولید لید" },
        type: "boolean",
        default: true,
      },
      {
        id: "networking",
        label: { en: "Networking engagement", fa: "تعامل شبکه‌سازی" },
        type: "boolean",
        default: true,
      },
      {
        id: "analyticsReport",
        label: { en: "Analytics reports", fa: "گزارش آنالیتیکس" },
        type: "boolean",
        default: true,
      },
    ],
  },
}

export const ALL_PLATFORM_KEYS: PlatformKey[] = [
  "instagram",
  "telegram",
  "whatsapp",
  "torob",
  "digikala",
  "linkedin",
]

export function platformLabel(key: PlatformKey, lang: "en" | "fa"): string {
  return PLATFORM_SPECS[key]?.label[lang] ?? key
}

export function emptyPlatformConfig(platform: PlatformKey): PlatformConfig {
  const spec = PLATFORM_SPECS[platform]
  const settings: Record<string, unknown> = {}
  for (const f of spec.fields)
    settings[f.id] = f.default ?? (f.type === "boolean" ? false : "")
  return { platform, settings }
}

export function configForPlatform(
  configs: PlatformConfig[],
  platform: PlatformKey,
): PlatformConfig | undefined {
  return (
    configs.find((c) => c.platform === platform) ??
    emptyPlatformConfig(platform)
  )
}
