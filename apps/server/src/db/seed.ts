import { db } from "./index"
import { hashPassword } from "../lib/password"
import * as schema from "./schema"

async function clearTables() {
  await db.delete(schema.aiMessages)
  await db.delete(schema.aiConversations)
  await db.delete(schema.affiliateCommissions)
  await db.delete(schema.affiliateCodes)
  await db.delete(schema.comments)
  await db.delete(schema.blogs)
  await db.delete(schema.stories)
  await db.delete(schema.ticketMessages)
  await db.delete(schema.tickets)
  await db.delete(schema.portfolioItems)
  await db.delete(schema.timeLogs)
  await db.delete(schema.events)
  await db.delete(schema.tasks)
  await db.delete(schema.cases)
  await db.delete(schema.payouts)
  await db.delete(schema.walletTransactions)
  await db.delete(schema.wallets)
  await db.delete(schema.reviews)
  await db.delete(schema.favorites)
  await db.delete(schema.contracts)
  await db.delete(schema.customOffers)
  await db.delete(schema.packages)
  await db.delete(schema.adminProfiles)
  await db.delete(schema.tools)
  await db.delete(schema.editors)
  await db.delete(schema.vibeCoders)
  await db.delete(schema.users)
}

async function seed() {
  console.log("[seed] clearing existing data...")
  await clearTables()

  console.log("[seed] inserting users...")
  const [superAdminUser, adminUser, employerUser] = await db
    .insert(schema.users)
    .values([
      {
        email: "superadmin@adminhub.ir",
        passwordHash: await hashPassword("password123"),
        role: "super_admin",
        nameEn: "Admin Owner",
        nameFa: "مالک ادمین",
        phone: "+989101010101",
        photo: "https://i.pravatar.cc/150?u=superadmin",
        phoneVerified: true,
      },
      {
        email: "admin@adminhub.ir",
        passwordHash: await hashPassword("password123"),
        role: "admin",
        nameEn: "Sarah Johnson",
        nameFa: "سارا جانسون",
        phone: "+989121234567",
        photo: "https://i.pravatar.cc/150?u=admin",
      },
      {
        email: "employer@example.com",
        passwordHash: await hashPassword("password123"),
        role: "employer",
        nameEn: "Ali Rezaei",
        nameFa: "علی رضایی",
        phone: "+989323456789",
        photo: "https://i.pravatar.cc/150?u=employer",
      },
    ])
    .returning()

  console.log("[seed] inserting admin profile...")
  const [adminProfile] = await db
    .insert(schema.adminProfiles)
    .values({
      userId: adminUser.id,
      photo: "https://i.pravatar.cc/150?u=admin",
      rating: 4.8,
      reviews: 124,
      verified: true,
      insured: true,
      monthlyToman: 85000000,
      monthlyUSD: 1200,
      bioEn: "Experienced social media manager specializing in Instagram and Telegram growth. I help brands build authentic communities through strategic content and engagement.",
      bioFa: "مدیر اجتماعی رسانه‌ها با تجربه در رشد اینستاگرام و تلگرام. به برندها کمک می‌کنم تا جامعه‌های اصیل از طریق استراتژی محتوا و تعامل بسازند.",
      skillsEn: ["social media", "content strategy", "community management", "analytics"],
      skillsFa: ["مدیریت شبکه‌های اجتماعی", "استراتژی محتوا", "مدیریت جامعه", "تحلیل داده"],
      platforms: ["instagram", "telegram"],
    })
    .returning()

  console.log("[seed] inserting packages...")
  const [pkg1, pkg2, pkg3, pkg4] = await db
    .insert(schema.packages)
    .values([
      {
        adminId: adminProfile.id,
        name: "Instagram Growth Basic",
        description: "Daily content posting, story management, and basic engagement for small businesses.",
        type: "platform",
        platforms: ["instagram"],
        platformConfigs: [
          { platform: "instagram", settings: { postsPerWeek: 5, storiesPerDay: 2 } },
        ],
        priceToman: 15000000,
        priceUSD: 350,
        billingCycle: "monthly",
        deliveryTime: "24 hours",
        featured: true,
        active: true,
      },
      {
        adminId: adminProfile.id,
        name: "Telegram Channel Management",
        description: "Full Telegram channel management including content curation, member growth, and community engagement.",
        type: "platform",
        platforms: ["telegram"],
        platformConfigs: [
          { platform: "telegram", settings: { postsPerDay: 3, memberGrowthTarget: 500 } },
        ],
        priceToman: 12000000,
        priceUSD: 280,
        billingCycle: "monthly",
        deliveryTime: "12 hours",
        featured: false,
        active: true,
      },
      {
        adminId: adminProfile.id,
        name: "Social Media Bundle Pro",
        description: "Complete social media management across Instagram and Telegram with advanced analytics and reporting.",
        type: "bundle",
        platforms: ["instagram", "telegram"],
        platformConfigs: [
          { platform: "instagram", settings: { postsPerWeek: 7, reelsPerWeek: 3 } },
          { platform: "telegram", settings: { postsPerDay: 4, memberGrowthTarget: 1000 } },
        ],
        priceToman: 28000000,
        priceUSD: 650,
        billingCycle: "monthly",
        deliveryTime: "6 hours",
        featured: true,
        active: true,
      },
      {
        adminId: adminProfile.id,
        name: "One-Time Campaign Setup",
        description: "Strategic campaign planning and execution for product launches, announcements, or special events.",
        type: "bundle",
        platforms: ["instagram", "telegram", "whatsapp"],
        platformConfigs: [
          { platform: "instagram", settings: { campaignType: "product_launch" } },
          { platform: "telegram", settings: { campaignType: "product_launch" } },
          { platform: "whatsapp", settings: { campaignType: "product_launch" } },
        ],
        priceToman: 45000000,
        priceUSD: 1000,
        billingCycle: "project",
        deliveryTime: "3 days",
        featured: false,
        active: true,
      },
    ])
    .returning()

  console.log("[seed] inserting custom offers...")
  const [offer1, offer2, offer3] = await db
    .insert(schema.customOffers)
    .values([
      {
        packageId: pkg1.id,
        adminId: adminProfile.id,
        employerId: employerUser.id,
        employerName: "Ali Rezaei",
        name: "Custom Instagram Package for Tech Startup",
        description: "Need a tailored Instagram management package for our SaaS startup launch. Includes Reels, Stories, and community building.",
        platforms: ["instagram"],
        platformConfigs: [
          { platform: "instagram", settings: { postsPerWeek: 7, reelsPerWeek: 4, focusOnLaunch: true } },
        ],
        proposedPriceToman: 20000000,
        proposedPriceUSD: 450,
        billingCycle: "monthly",
        deliveryTime: "48 hours",
        startDate: "2025-02-01",
        endDate: "2025-08-01",
        message: "We are launching a new SaaS product and need strong Instagram presence.",
      },
      {
        packageId: pkg2.id,
        adminId: adminProfile.id,
        employerId: employerUser.id,
        employerName: "Ali Rezaei",
        name: "Telegram Channel Growth - 6 Months",
        description: "Looking for Telegram channel management with focus on member acquisition and content strategy for 6 months.",
        platforms: ["telegram"],
        platformConfigs: [
          { platform: "telegram", settings: { postsPerDay: 3, memberGrowthTarget: 2000, duration: "6_months" } },
        ],
        proposedPriceToman: 75000000,
        proposedPriceUSD: 1800,
        billingCycle: "monthly",
        deliveryTime: "24 hours",
        startDate: "2025-01-15",
        endDate: "2025-07-15",
        message: "We want to grow our Telegram channel to 10k members in 6 months.",
      },
      {
        packageId: pkg3.id,
        adminId: adminProfile.id,
        employerId: employerUser.id,
        employerName: "Ali Rezaei",
        name: "Bundle Plus - Advanced Analytics Add-on",
        description: "Adding advanced analytics and competitor benchmarking to our existing bundle.",
        platforms: ["instagram", "telegram"],
        platformConfigs: [
          { platform: "instagram", settings: { includeAnalytics: true, competitorTracking: true } },
          { platform: "telegram", settings: { includeAnalytics: true, competitorTracking: true } },
        ],
        proposedPriceToman: 32000000,
        proposedPriceUSD: 750,
        billingCycle: "monthly",
        deliveryTime: "12 hours",
        message: "Please add weekly analytics reports and competitor analysis to the bundle.",
      },
    ])
    .returning()

  console.log("[seed] inserting contracts...")
  const [contract1, contract2] = await db
    .insert(schema.contracts)
    .values([
      {
        code: "CNT-2025-001",
        employerId: employerUser.id,
        adminId: adminProfile.id,
        platform: "instagram",
        status: "active",
        amountToman: 15000000,
        amountUSD: 350,
        hasInsurance: true,
        hasSubstitute: false,
        termClause: "Monthly retainer for Instagram management. Payment due on the 1st of each month.",
        substituteClause: "No substitute admin will be provided. Account access must be maintained.",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        signedByEmployerAt: "2025-01-01T10:00:00Z",
        signedByAdminAt: "2025-01-01T12:00:00Z",
      },
      {
        code: "CNT-2025-002",
        employerId: employerUser.id,
        adminId: adminProfile.id,
        platform: "telegram",
        status: "pending",
        amountToman: 12000000,
        amountUSD: 280,
        hasInsurance: true,
        hasSubstitute: true,
        termClause: "Monthly Telegram channel management with member growth guarantees.",
        substituteClause: "In case of unavailability, a substitute admin with similar expertise will be assigned within 48 hours.",
        startDate: "2025-02-01",
        endDate: "2025-08-01",
      },
    ])
    .returning()

  console.log("[seed] inserting reviews...")
  await db.insert(schema.reviews).values([
    {
      adminId: adminProfile.id,
      employerId: employerUser.id,
      contractId: contract1.id,
      rating: 5,
      comment: "Excellent Instagram management. Very professional and responsive.",
    },
    {
      adminId: adminProfile.id,
      employerId: employerUser.id,
      contractId: contract2.id,
      rating: 4,
      comment: "Good Telegram management, could improve on reporting frequency.",
    },
  ])

  console.log("[seed] inserting wallets...")
  const [employerWallet, adminWallet] = await db
    .insert(schema.wallets)
    .values([
      { userId: employerUser.id, balanceToman: 50000000, balanceUSD: 500, currency: "IRR" },
      { userId: adminUser.id, balanceToman: 0, balanceUSD: 1200, currency: "USD" },
    ])
    .returning()

  console.log("[seed] inserting wallet transactions...")
  await db.insert(schema.walletTransactions).values([
    { walletId: employerWallet.id, type: "deposit", amountToman: 100000000, amountUSD: 0, currency: "IRR", status: "completed", note: "Initial deposit" },
    { walletId: employerWallet.id, type: "payment", amountToman: 15000000, amountUSD: 0, currency: "IRR", status: "completed", referenceId: contract1.code, note: "Contract payment" },
  ])

  console.log("[seed] inserting favorites...")
  await db.insert(schema.favorites).values([
    {
      userId: employerUser.id,
      adminId: adminProfile.id,
    },
  ])

  console.log("[seed] inserting tools...")
  const [tool1, tool2, tool3, tool4, tool5] = await db
    .insert(schema.tools)
    .values([
      {
        name: "Canva",
        category: "design",
        icon: "🎨",
        rating: 4.7,
        reviews: 15420,
        popular: true,
        priceToman: 0,
        priceUSD: 0,
        descEn: "Free online design tool for creating social media graphics, presentations, and marketing materials.",
        descFa: "ابزار طراحی آنلاین رایگان برای ایجاد گرافیک‌های شبکه‌های اجتماعی، ارائه‌ها و مواد بازاریابی.",
        active: true,
      },
      {
        name: "Hootsuite",
        category: "scheduling",
        icon: "📅",
        rating: 4.3,
        reviews: 8920,
        popular: true,
        priceToman: 0,
        priceUSD: 19,
        descEn: "Social media management platform for scheduling posts, tracking analytics, and managing multiple accounts.",
        descFa: "پلتفرم مدیریت شبکه‌های اجتماعی برای زمان‌بندی پست‌ها، پیگیری تحلیل‌ها و مدیریت چندین حساب.",
        active: true,
      },
      {
        name: "Buffer",
        category: "scheduling",
        icon: "📝",
        rating: 4.4,
        reviews: 6750,
        popular: true,
        priceToman: 0,
        priceUSD: 6,
        descEn: "Simple and intuitive social media scheduling tool for individuals and small teams.",
        descFa: "ابزار زمان‌بندی ساده و شهودی شبکه‌های اجتماعی برای افراد و تیم‌های کوچک.",
        active: true,
      },
      {
        name: "Meta Business Suite",
        category: "management",
        icon: "📘",
        rating: 4.2,
        reviews: 12300,
        popular: true,
        priceToman: 0,
        priceUSD: 0,
        descEn: "Free tool from Meta to manage Facebook and Instagram accounts, schedule posts, and view insights.",
        descFa: "ابزار رایگان متا برای مدیریت حساب‌های فیسبوک و اینستاگرام، زمان‌بندی پست‌ها و مشاهده بینش‌ها.",
        active: true,
      },
      {
        name: "Notion",
        category: "productivity",
        icon: "📒",
        rating: 4.8,
        reviews: 22100,
        popular: true,
        priceToman: 0,
        priceUSD: 8,
        descEn: "All-in-one workspace for notes, tasks, wikis, and databases. Great for content planning.",
        descFa: "فضای کار همه‌کاره برای یادداشت‌ها، وظایف، ویکی‌ها و پایگاه‌های داده. عالی برای برنامه‌ریزی محتوا.",
        active: true,
      },
    ])
    .returning()

  console.log("[seed] inserting editors...")
  const [editor1, editor2, editor3] = await db
    .insert(schema.editors)
    .values([
      {
        nameEn: "Mina Hosseini",
        nameFa: "مینا حسینی",
        photo: "https://i.pravatar.cc/150?u=mina",
        specialty: "Video Editing & Motion Graphics",
        rating: 4.9,
        reviews: 87,
        projects: 342,
        delivery: "3 days",
        rateToman: 8500000,
        rateUSD: 200,
        bioEn: "Professional video editor with 8+ years of experience in social media content, commercials, and short-form videos.",
        bioFa: "ویرایشگر حرفه‌ای ویدیو با بیش از ۸ سال تجربه در محتوای شبکه‌های اجتماعی، تبلیغات و ویدیوهای کوتاه.",
        active: true,
      },
      {
        nameEn: "Reza Karimi",
        nameFa: "رضا کریمی",
        photo: "https://i.pravatar.cc/150?u=reza",
        specialty: "Graphic Design & Branding",
        rating: 4.7,
        reviews: 64,
        projects: 218,
        delivery: "2 days",
        rateToman: 6000000,
        rateUSD: 140,
        bioEn: "Creative graphic designer specializing in brand identity, social media visuals, and marketing materials.",
        bioFa: "طراح گرافیک خلاق متخصص در هویت برند، بصری‌های شبکه‌های اجتماعی و مواد بازاریابی.",
        active: true,
      },
      {
        nameEn: "Parvin Ahmadi",
        nameFa: "پروین احمدی",
        photo: "https://i.pravatar.cc/150?u=parvin",
        specialty: "Content Writing & Copywriting",
        rating: 4.8,
        reviews: 112,
        projects: 456,
        delivery: "24 hours",
        rateToman: 4500000,
        rateUSD: 100,
        bioEn: "Bilingual content writer and copywriter helping brands tell compelling stories in both Persian and English.",
        bioFa: "نویسنده محتوا و کپی‌رایتر دوزبانه که به برندها کمک می‌کند داستان‌های جذابی به فارسی و انگلیسی روایت کنند.",
        active: true,
      },
    ])
    .returning()

  console.log("[seed] inserting vibe coders...")
  const [vc1, vc2, vc3] = await db
    .insert(schema.vibeCoders)
    .values([
      {
        nameEn: "Kian Moghaddam",
        nameFa: "کیان مقدم",
        photo: "https://i.pravatar.cc/150?u=kian",
        stack: "React, Next.js, TypeScript, Tailwind CSS",
        rating: 4.9,
        reviews: 45,
        projects: 128,
        rateToman: 12000000,
        rateUSD: 280,
        delivery: "5 days",
        bioEn: "Full-stack developer specializing in modern web technologies. Building fast, accessible, and beautiful applications.",
        bioFa: "توسعه‌دهنده فول‌استک متخصص در فناوری‌های وب مدرن. ساخت برنامه‌های سریع، قابل دسترس و زیبا.",
        active: true,
      },
      {
        nameEn: "Sara Naderi",
        nameFa: "سارا نادری",
        photo: "https://i.pravatar.cc/150?u=sara",
        stack: "Node.js, Python, PostgreSQL, Redis",
        rating: 4.8,
        reviews: 38,
        projects: 96,
        rateToman: 11000000,
        rateUSD: 250,
        delivery: "4 days",
        bioEn: "Backend engineer with strong database and API design skills. Expert in scalable system architecture.",
        bioFa: "مهندس بک‌اند با مهارت‌های قوی در پایگاه داده و طراحی API. متخصص در معماری سیستم‌های مقیاس‌پذیر.",
        active: true,
      },
      {
        nameEn: "Amir Hosseini",
        nameFa: "امیر حسینی",
        photo: "https://i.pravatar.cc/150?u=amir",
        stack: "Flutter, Dart, Firebase, Supabase",
        rating: 4.7,
        reviews: 29,
        projects: 74,
        rateToman: 9500000,
        rateUSD: 220,
        delivery: "7 days",
        bioEn: "Mobile developer crafting cross-platform apps with Flutter. Passionate about smooth UX and clean code.",
        bioFa: "توسعه‌دهنده موبایل که اپ‌های چندپلتفرمی با فلاتر می‌سازد. مشتاق درباره تجربه کاربری روان و کد تمیز.",
        active: true,
      },
    ])
    .returning()

  console.log("[seed] inserting case and tasks...")
  const [case1] = await db
    .insert(schema.cases)
    .values({
      adminId: adminProfile.id,
      employerId: employerUser.id,
      title: "Instagram Q1 Campaign",
      description: "Full campaign for Q1 Instagram growth including content calendar and engagement strategy.",
      priority: "high",
      status: "in_progress",
      tags: ["instagram", "campaign", "q1"],
    })
    .returning()

  await db.insert(schema.tasks).values([
    { caseId: case1.id, title: "Content calendar design", description: "Create weekly content calendar", status: "done", priority: "high" },
    { caseId: case1.id, title: "Stories setup", description: "Configure story highlights and templates", status: "in_progress", priority: "medium" },
  ])

  console.log("[seed] inserting event and timelog...")
  await db.insert(schema.events).values([
    { userId: adminUser.id, title: "Content Review", description: "Weekly content review meeting", startAt: "2025-02-01T14:00:00Z", endAt: "2025-02-01T15:00:00Z", allDay: false, color: "#3b82f6" },
    { userId: employerUser.id, title: "Campaign Kickoff", description: "Q1 campaign kickoff call", startAt: "2025-02-05T10:00:00Z", endAt: "2025-02-05T11:00:00Z", allDay: false, color: "#10b981" },
  ])

  await db.insert(schema.timeLogs).values([
    { userId: adminUser.id, caseId: case1.id, taskId: null, description: "Content calendar design", startedAt: "2025-01-20T09:00:00Z", endedAt: "2025-01-20T12:00:00Z", durationMinutes: 180 },
  ])

  console.log("[seed] inserting portfolio...")
  await db.insert(schema.portfolioItems).values([
    { adminId: adminProfile.id, title: "Brand Launch Campaign", description: "Complete Instagram launch for tech startup", mediaUrl: "https://example.com/portfolio/1.jpg", mediaType: "image", tags: ["instagram", "launch"] },
    { adminId: adminProfile.id, title: "Telegram Growth Strategy", description: "6-month Telegram growth to 10k members", mediaUrl: "https://example.com/portfolio/2.pdf", mediaType: "link", tags: ["telegram", "growth"] },
  ])

  console.log("[seed] inserting tickets...")
  const [ticket1] = await db
    .insert(schema.tickets)
    .values({
      userId: employerUser.id,
      subject: "Payment issue with contract",
      category: "billing",
      priority: "high",
      status: "open",
    })
    .returning()

  await db.insert(schema.ticketMessages).values([
    { ticketId: ticket1.id, senderId: employerUser.id, body: "I was charged twice for the same contract. Please investigate." },
  ])

  console.log("[seed] inserting stories and blogs...")
  const [story1] = await db
    .insert(schema.stories)
    .values({
      authorId: adminUser.id,
      title: "How I Grew 50k Instagram Followers",
      content: "In this story I share my proven strategies for growing Instagram followers organically...",
      coverUrl: "https://example.com/stories/1.jpg",
      status: "published",
      views: 1240,
    })
    .returning()

  const [blog1] = await db
    .insert(schema.blogs)
    .values({
      authorId: adminUser.id,
      title: "The Future of Social Media Marketing in Iran",
      content: "Social media marketing in Iran is evolving rapidly. Here are the key trends to watch in 2025...",
      coverUrl: "https://example.com/blogs/1.jpg",
      status: "published",
      views: 856,
    })
    .returning()

  await db.insert(schema.comments).values([
    { postId: story1.id, postType: "story", authorId: employerUser.id, body: "Great insights! Thanks for sharing.", parentId: null },
    { postId: blog1.id, postType: "blog", authorId: employerUser.id, body: "Very informative article.", parentId: null },
  ])

  console.log("[seed] inserting AI models...")
  const [modelGpt4o, modelClaudeSonnet, modelOpenRouterGpt5] = await db
    .insert(schema.aiModels)
    .values([
      {
        provider: "openai",
        code: "gpt-4o",
        name: "GPT-4o",
        description: "OpenAI's most advanced multimodal model",
        inputCost: 0.000003,
        outputCost: 0.000012,
        contextWindow: 128000,
        defaultTemperature: 0.7,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsVision: true,
        isActive: true,
      },
      {
        provider: "anthropic",
        code: "claude-sonnet-4-20250514",
        name: "Claude Sonnet",
        description: "Anthropic's balanced intelligence and speed model",
        inputCost: 0.000003,
        outputCost: 0.000015,
        contextWindow: 200000,
        defaultTemperature: 0.7,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsVision: true,
        isActive: true,
      },
      {
        provider: "openrouter",
        code: "openai/gpt-5",
        name: "OpenRouter GPT-5",
        description: "GPT-5 via OpenRouter",
        inputCost: 0.000005,
        outputCost: 0.00002,
        contextWindow: 128000,
        defaultTemperature: 0.7,
        maxOutputTokens: 4096,
        supportsStreaming: true,
        supportsVision: true,
        isActive: true,
      },
    ])
    .returning()

  console.log("[seed] inserting AI conversations...")
  const [conv1] = await db
    .insert(schema.aiConversations)
    .values({
      userId: employerUser.id,
      title: "Marketing Strategy Help",
      modelId: modelGpt4o.id,
    })
    .returning()

  await db.insert(schema.aiMessages).values([
    { conversationId: conv1.id, role: "user", content: "How can I improve my Instagram engagement?" },
    { conversationId: conv1.id, role: "assistant", content: "Here are 7 proven strategies to boost Instagram engagement..." },
  ])

  console.log("[seed] inserting affiliate data...")
  const [affiliateCode] = await db
    .insert(schema.affiliateCodes)
    .values({
      userId: employerUser.id,
      code: "ALI2025",
      isActive: true,
    })
    .returning()

  await db.insert(schema.affiliateCommissions).values([
    { codeId: affiliateCode.id, referrerId: employerUser.id, referredId: adminUser.id, amountToman: 500000, amountUSD: 0, status: "pending" },
  ])

  console.log("[seed] inserting payouts...")
  await db.insert(schema.payouts).values([
    { userId: adminUser.id, amountToman: 0, amountUSD: 500, currency: "USD", method: "paypal", accountDetails: { email: "sarah@example.com" }, status: "pending" },
  ])

  console.log("[seed] done.")
}

seed().catch((err) => {
  console.error("[seed] failed", err)
  process.exit(1)
})
