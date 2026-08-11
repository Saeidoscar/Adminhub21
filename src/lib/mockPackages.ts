import type {
  AdminProfile,
  ContractPackage,
  CustomOffer,
  PlatformKey,
} from "@adminhub/shared"

export const ADMIN_PROFILES: AdminProfile[] = [
  {
    id: "1",
    nameEn: "Arya Ahmadi",
    nameFa: "آریا احمدی",
    photo: "photo-1507003211169-0a1dd7228f2d",
    platforms: ["instagram", "telegram"],
    rating: 4.9,
    reviews: 127,
    verified: true,
    insured: true,
    monthlyToman: 4500000,
    monthlyUSD: 108,
    bioEn:
      "Instagram growth expert with 5+ years managing brand accounts. Specializes in Reels production and engagement strategy.",
    bioFa:
      "متخصص رشد اینستاگرام با بیش از ۵ سال تجربه مدیریت برندها. تخصص در تولید ریلز و استراتژی تعامل.",
    skillsEn: [
      "Reels Production",
      "Growth Hacking",
      "Content Strategy",
      "Analytics",
    ],
    skillsFa: ["تولید ریلز", "رشد حساب", "استراتژی محتوا", "آنالیتیکس"],
  },
  {
    id: "2",
    nameEn: "Sara Mohammadi",
    nameFa: "سارا محمدی",
    photo: "photo-1494790108377-be9c29b29330",
    platforms: ["whatsapp", "instagram"],
    rating: 4.8,
    reviews: 89,
    verified: true,
    insured: true,
    monthlyToman: 3800000,
    monthlyUSD: 91,
    bioEn:
      "WhatsApp business channel manager with expertise in customer journey design and automated funnel setup.",
    bioFa:
      "مدیر کانال‌های تجاری واتساپ با تخصص در طراحی سفر مشتری و راه‌اندازی قیف خودکار.",
    skillsEn: ["WhatsApp Business", "Customer Journey", "Funnel Design", "CRM"],
    skillsFa: ["واتساپ بیزینس", "سفر مشتری", "طراحی قیف", "CRM"],
  },
  {
    id: "3",
    nameEn: "Dariush Rezaei",
    nameFa: "داریوش رضایی",
    photo: "photo-1500648767791-00dcc994a43e",
    platforms: ["torob", "digikala"],
    rating: 4.7,
    reviews: 203,
    verified: true,
    insured: false,
    monthlyToman: 5200000,
    monthlyUSD: 124,
    bioEn:
      "Senior e-commerce admin specializing in Torob and Digikala product listing optimization, pricing strategy, and sales analytics.",
    bioFa:
      "ادمین ارشد تجارت الکترونیک متخصص در بهینه‌سازی لیست محصولات ترب و دیجی‌کالا، استراتژی قیمت‌گذاری.",
    skillsEn: [
      "Torob SEO",
      "Digikala Ads",
      "Pricing Strategy",
      "Inventory Mgmt",
    ],
    skillsFa: ["سئو ترب", "تبلیغات دیجی‌کالا", "استراتژی قیمت", "مدیریت موجودی"],
  },
  {
    id: "4",
    nameEn: "Mina Hosseini",
    nameFa: "مینا حسینی",
    photo: "photo-1438761681033-6461ffad8d80",
    platforms: ["instagram", "linkedin", "telegram"],
    rating: 4.9,
    reviews: 64,
    verified: true,
    insured: true,
    monthlyToman: 6000000,
    monthlyUSD: 143,
    bioEn:
      "B2B content specialist for Instagram and LinkedIn. Helps professional service brands build authority and generate leads.",
    bioFa:
      "متخصص محتوای B2B برای اینستاگرام و لینکدین. به برندهای خدمات حرفه‌ای کمک می‌کند اعتبار بسازند.",
    skillsEn: [
      "B2B Content",
      "Lead Generation",
      "LinkedIn Strategy",
      "Brand Voice",
    ],
    skillsFa: ["محتوای B2B", "تولید لید", "استراتژی لینکدین", "صدای برند"],
  },
  {
    id: "5",
    nameEn: "Reza Karimi",
    nameFa: "رضا کریمی",
    photo: "photo-1472099645785-5658abf4ff4e",
    platforms: ["telegram", "whatsapp"],
    rating: 4.6,
    reviews: 156,
    verified: false,
    insured: false,
    monthlyToman: 3200000,
    monthlyUSD: 76,
    bioEn:
      "Telegram channel administrator with experience managing 100k+ member communities. Expert in engagement campaigns.",
    bioFa:
      "مدیر کانال تلگرام با تجربه مدیریت جوامع ۱۰۰هزار+ عضوی. متخصص در کمپین‌های تعامل.",
    skillsEn: [
      "Telegram Channels",
      "Community Mgmt",
      "Engagement Campaigns",
      "Bot Setup",
    ],
    skillsFa: ["کانال تلگرام", "مدیریت جامعه", "کمپین تعامل", "راه‌اندازی بات"],
  },
  {
    id: "6",
    nameEn: "Neda Farahani",
    nameFa: "ندا فراهانی",
    photo: "photo-1534528741775-53994a69daeb",
    platforms: ["instagram", "torob", "telegram"],
    rating: 5.0,
    reviews: 41,
    verified: true,
    insured: true,
    monthlyToman: 7000000,
    monthlyUSD: 167,
    bioEn:
      "Multi-platform specialist with a holistic approach to social commerce. Connects Instagram audiences to Torob product listings.",
    bioFa:
      "متخصص چندپلتفرمی با رویکرد کلی‌نگر به تجارت اجتماعی. مخاطبان اینستاگرام را به محصولات ترب متصل می‌کند.",
    skillsEn: [
      "Social Commerce",
      "Multi-platform Mgmt",
      "Conversion Funnels",
      "Paid Ads",
    ],
    skillsFa: [
      "تجارت اجتماعی",
      "مدیریت چندپلتفرمی",
      "قیف تبدیل",
      "تبلیغات پولی",
    ],
  },
]

const now = () => new Date().toISOString()

export const DEFAULT_PACKAGES: ContractPackage[] = [
  {
    id: "pkg-1-1",
    adminId: "1",
    name: "Instagram Starter",
    description:
      "30 posts, 30 stories, 12 reels per month with daily DM & comment management.",
    type: "platform",
    platforms: ["instagram"],
    platformConfigs: [
      {
        platform: "instagram",
        settings: {
          postsPerMonth: 30,
          storiesPerMonth: 30,
          reelsPerMonth: 12,
          dmResponse: true,
          commentReplies: true,
          analyticsReport: true,
          adManagement: false,
        },
      },
    ],
    priceToman: 3500000,
    priceUSD: 84,
    billingCycle: "monthly",
    deliveryTime: "Within 48h",
    featured: false,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-1-2",
    adminId: "1",
    name: "Instagram Growth",
    description:
      "Full Instagram growth: 50 posts, 50 stories, 20 reels, ads management, analytics reports included.",
    type: "platform",
    platforms: ["instagram"],
    platformConfigs: [
      {
        platform: "instagram",
        settings: {
          postsPerMonth: 50,
          storiesPerMonth: 50,
          reelsPerMonth: 20,
          dmResponse: true,
          commentReplies: true,
          analyticsReport: true,
          adManagement: true,
        },
      },
    ],
    priceToman: 4500000,
    priceUSD: 108,
    billingCycle: "monthly",
    deliveryTime: "Within 24h",
    featured: true,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-1-3",
    adminId: "1",
    name: "Instagram + Telegram Bundle",
    description:
      "Complete Instagram + Telegram presence covering growth, reels, stories, channel posts and DMs across both platforms.",
    type: "bundle",
    platforms: ["instagram", "telegram"],
    platformConfigs: [
      {
        platform: "instagram",
        settings: {
          postsPerMonth: 40,
          storiesPerMonth: 45,
          reelsPerMonth: 16,
          dmResponse: true,
          commentReplies: true,
          analyticsReport: true,
          adManagement: true,
        },
      },
      {
        platform: "telegram",
        settings: {
          channelPostsPerMonth: 20,
          storyPostsPerMonth: 10,
          dmGroupResponse: true,
          engagementCampaigns: true,
          botSetup: true,
          analyticsReport: true,
        },
      },
    ],
    priceToman: 7500000,
    priceUSD: 179,
    billingCycle: "monthly",
    deliveryTime: "Within 24h",
    featured: false,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-2-1",
    adminId: "2",
    name: "WhatsApp Commerce",
    description:
      "WhatsApp Business catalog management with 50+ catalog items, 4 weekly broadcasts and automated replies.",
    type: "platform",
    platforms: ["whatsapp"],
    platformConfigs: [
      {
        platform: "whatsapp",
        settings: {
          catalogItems: 50,
          broadcastsPerWeek: 4,
          automatedReplies: true,
          labels: true,
          quickReplies: true,
        },
      },
    ],
    priceToman: 3800000,
    priceUSD: 91,
    billingCycle: "monthly",
    deliveryTime: "Within 36h",
    featured: true,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-2-2",
    adminId: "2",
    name: "Instagram + WhatsApp Bundle",
    description:
      "Instagram growth paired with WhatsApp Business catalog management and automated customer communication.",
    type: "bundle",
    platforms: ["instagram", "whatsapp"],
    platformConfigs: [
      {
        platform: "instagram",
        settings: {
          postsPerMonth: 35,
          storiesPerMonth: 40,
          reelsPerMonth: 14,
          dmResponse: true,
          commentReplies: true,
          analyticsReport: true,
          adManagement: true,
        },
      },
      {
        platform: "whatsapp",
        settings: {
          catalogItems: 80,
          broadcastsPerWeek: 5,
          automatedReplies: true,
          labels: true,
          quickReplies: true,
        },
      },
    ],
    priceToman: 7200000,
    priceUSD: 172,
    billingCycle: "monthly",
    deliveryTime: "Within 24h",
    featured: false,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-3-1",
    adminId: "3",
    name: "Torob + Digikala E-commerce",
    description:
      "Complete marketplace management: 100 product listings on each, pricing, inventory sync and SEO across both platforms.",
    type: "bundle",
    platforms: ["torob", "digikala"],
    platformConfigs: [
      {
        platform: "torob",
        settings: {
          productListings: 100,
          pricingUpdates: true,
          inventorySync: true,
          seoOptimization: true,
          torobAds: true,
        },
      },
      {
        platform: "digikala",
        settings: {
          productListings: 100,
          pricingStrategy: true,
          inventoryMgmt: true,
          digikalaAds: true,
          analyticsReport: true,
        },
      },
    ],
    priceToman: 5200000,
    priceUSD: 124,
    billingCycle: "monthly",
    deliveryTime: "Within 48h",
    featured: true,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-4-1",
    adminId: "4",
    name: "LinkedIn B2B",
    description:
      "Professional LinkedIn presence: 8 posts/month, 2 articles, lead generation and networking engagement.",
    type: "platform",
    platforms: ["linkedin"],
    platformConfigs: [
      {
        platform: "linkedin",
        settings: {
          postsPerMonth: 8,
          articlePublishing: 2,
          leadGeneration: true,
          networking: true,
          analyticsReport: true,
        },
      },
    ],
    priceToman: 4800000,
    priceUSD: 115,
    billingCycle: "monthly",
    deliveryTime: "Within 48h",
    featured: false,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-4-2",
    adminId: "4",
    name: "Instagram + LinkedIn Bundle",
    description:
      "B2B growth bundle: Instagram presence + LinkedIn thought leadership with cross-platform analytics.",
    type: "bundle",
    platforms: ["instagram", "linkedin"],
    platformConfigs: [
      {
        platform: "instagram",
        settings: {
          postsPerMonth: 30,
          storiesPerMonth: 20,
          reelsPerMonth: 8,
          dmResponse: true,
          commentReplies: true,
          analyticsReport: true,
          adManagement: true,
        },
      },
      {
        platform: "linkedin",
        settings: {
          postsPerMonth: 8,
          articlePublishing: 2,
          leadGeneration: true,
          networking: true,
          analyticsReport: true,
        },
      },
    ],
    priceToman: 8500000,
    priceUSD: 203,
    billingCycle: "monthly",
    deliveryTime: "Within 24h",
    featured: false,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-5-1",
    adminId: "5",
    name: "Telegram Community",
    description:
      "Manage Telegram channels & groups: 20 posts, 10 stories, engagement campaigns and bot automation.",
    type: "platform",
    platforms: ["telegram"],
    platformConfigs: [
      {
        platform: "telegram",
        settings: {
          channelPostsPerMonth: 20,
          storyPostsPerMonth: 10,
          dmGroupResponse: true,
          engagementCampaigns: true,
          botSetup: false,
          analyticsReport: true,
        },
      },
    ],
    priceToman: 3200000,
    priceUSD: 76,
    billingCycle: "monthly",
    deliveryTime: "Within 24h",
    featured: false,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-5-2",
    adminId: "5",
    name: "Telegram + WhatsApp Bundle",
    description:
      "Messaging bundle covering both Telegram community management and WhatsApp Business automation.",
    type: "bundle",
    platforms: ["telegram", "whatsapp"],
    platformConfigs: [
      {
        platform: "telegram",
        settings: {
          channelPostsPerMonth: 25,
          storyPostsPerMonth: 15,
          dmGroupResponse: true,
          engagementCampaigns: true,
          botSetup: true,
          analyticsReport: true,
        },
      },
      {
        platform: "whatsapp",
        settings: {
          catalogItems: 60,
          broadcastsPerWeek: 6,
          automatedReplies: true,
          labels: true,
          quickReplies: true,
        },
      },
    ],
    priceToman: 5800000,
    priceUSD: 139,
    billingCycle: "monthly",
    deliveryTime: "Within 48h",
    featured: false,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-6-1",
    adminId: "6",
    name: "Social Commerce Pro",
    description:
      "Full-stack social commerce: Instagram growth, Telegram community, and Torob SEO + listings bundled together.",
    type: "bundle",
    platforms: ["instagram", "telegram", "torob"],
    platformConfigs: [
      {
        platform: "instagram",
        settings: {
          postsPerMonth: 45,
          storiesPerMonth: 45,
          reelsPerMonth: 18,
          dmResponse: true,
          commentReplies: true,
          analyticsReport: true,
          adManagement: true,
        },
      },
      {
        platform: "telegram",
        settings: {
          channelPostsPerMonth: 25,
          storyPostsPerMonth: 12,
          dmGroupResponse: true,
          engagementCampaigns: true,
          botSetup: true,
          analyticsReport: true,
        },
      },
      {
        platform: "torob",
        settings: {
          productListings: 120,
          pricingUpdates: true,
          inventorySync: true,
          seoOptimization: true,
          torobAds: true,
        },
      },
    ],
    priceToman: 9500000,
    priceUSD: 227,
    billingCycle: "monthly",
    deliveryTime: "Within 24h",
    featured: true,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
  {
    id: "pkg-6-2",
    adminId: "6",
    name: "Instagram Specialist",
    description:
      "Instagram-only premium management with reels, stories, DMs and ads.",
    type: "platform",
    platforms: ["instagram"],
    platformConfigs: [
      {
        platform: "instagram",
        settings: {
          postsPerMonth: 40,
          storiesPerMonth: 40,
          reelsPerMonth: 15,
          dmResponse: true,
          commentReplies: true,
          analyticsReport: true,
          adManagement: true,
        },
      },
    ],
    priceToman: 4800000,
    priceUSD: 115,
    billingCycle: "monthly",
    deliveryTime: "Within 36h",
    featured: false,
    active: true,
    createdAt: now(),
    updatedAt: now(),
  },
]

export const ALL_PACKAGES = DEFAULT_PACKAGES
export const ALL_OFFERS: CustomOffer[] = []

export function adminById(id: number | string): AdminProfile | undefined {
  return ADMIN_PROFILES.find((a) => String(a.id) === String(id))
}

export function packagesByAdmin(adminId: string): ContractPackage[] {
  return ALL_PACKAGES.filter((p) => p.adminId === adminId && p.active !== false)
}

export function packageById(id: string): ContractPackage | undefined {
  return ALL_PACKAGES.find((p) => p.id === id)
}

export function packagesByPlatform(platform: PlatformKey): ContractPackage[] {
  return ALL_PACKAGES.filter(
    (p) => p.platforms.includes(platform) && p.active !== false,
  )
}
