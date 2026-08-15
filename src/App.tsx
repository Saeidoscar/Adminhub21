import { useState, useEffect, createContext, useContext } from "react"
import {
  useLocation,
  useNavigate,
  Navigate,
  Routes,
  Route,
} from "react-router-dom"
import { t, type Lang } from "./i18n"
import { Icon } from "./components/layout/Icon"
import { Sidebar } from "./components/layout/Sidebar"
import { Topbar, MobileTopbar } from "./components/layout/Topbar"
import { Stars } from "./components/platform/Stars"
import { Badge } from "./components/ui/Badge"
import { useTheme } from "./design-system/ThemeProvider"
import AdminPackagesPage from "./pages/AdminPackagesPage"
import AdminPublicProfilePage from "./pages/AdminPublicProfilePage"
import PackageComparisonPage from "./pages/PackageComparisonPage"
import ToolsRentalPage from "./pages/ToolsRentalPage"
import EditorsPage from "./pages/EditorsPage"
import VibeCodersPage from "./pages/VibeCodersPage"
import AiPage from "./pages/AiPage"

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "employer" | "admin"
type Page = "dashboard" | "marketplace" | "toolsRental" | "editors" | "vibeCoders" | "skills" | "contracts" | "ai" | "profile" | "packages" | "compare"

interface AppCtx {
  lang: Lang
  setLang: (l: Lang) => void
  role: Role
  page: Page
  setPage: (p: Page) => void
  tr: typeof t["en"]
  dir: "ltr" | "rtl"
}

const Ctx = createContext<AppCtx>(null as never)
const useApp = () => useContext(Ctx)

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ADMINS = [
  {
    id: 1,
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
    id: 2,
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
    id: 3,
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
    id: 4,
    nameEn: "Mina Hosseini",
    nameFa: "مینا حسینی",
    photo: "photo-1438761681033-6461ffad8d80",
    platforms: ["instagram", "linkedin"],
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
    id: 5,
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
    id: 6,
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

const CONTRACTS = [
  {
    id: "C-1042",
    adminEn: "Arya Ahmadi",
    adminFa: "آریا احمدی",
    platform: "instagram",
    status: "active",
    amountToman: 4500000,
    amountUSD: 108,
    hasInsurance: true,
    hasSubstitute: false,
  },
  {
    id: "C-1039",
    adminEn: "Neda Farahani",
    adminFa: "ندا فراهانی",
    platform: "torob",
    status: "pending",
    amountToman: 3200000,
    amountUSD: 76,
    hasInsurance: true,
    hasSubstitute: false,
  },
  {
    id: "C-1031",
    adminEn: "Dariush Rezaei",
    adminFa: "داریوش رضایی",
    platform: "digikala",
    status: "completed",
    amountToman: 5200000,
    amountUSD: 124,
    hasInsurance: false,
    hasSubstitute: false,
  },
  {
    id: "C-1028",
    adminEn: "Sara Mohammadi",
    adminFa: "سارا محمدی",
    platform: "whatsapp",
    status: "disputed",
    amountToman: 3800000,
    amountUSD: 91,
    hasInsurance: true,
    hasSubstitute: true,
  },
]

const PLATFORM_COLORS: Record<string, string> = {
  instagram: "badge-instagram",
  telegram: "badge-telegram",
  whatsapp: "badge-whatsapp",
  torob: "badge-torob",
  digikala: "badge-digikala",
  linkedin: "badge-linkedin",
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: "Instagram",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  torob: "Torob",
  digikala: "Digikala",
  linkedin: "LinkedIn",
}

// ─── Platform Badge ───────────────────────────────────────────────────────────

function AuthPage({ onLogin }: { onLogin: (role: Role) => void }) {
  const { tr, dir, lang, setLang } = useApp()
  const [tab, setTab] = useState<"login" | "register">("login")
  const [role, setRole] = useState<Role>("employer")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")

  return (
    <div className="min-h-screen flex" dir={dir}>
      {/* Left panel — hero */}
      <div className="hidden lg:flex lg:w-1/2 auth-gradient flex-col justify-between p-12 text-white relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, #fff 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-9 h-9 rounded-lg bg-amber-400 flex items-center justify-center">
              <Icon name="bot" size={20} className="text-navy-900" />
            </div>
            <span className="text-xl font-bold">{tr.brand}</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            {lang === "fa"
              ? "بازار کار متخصصان دیجیتال"
              : "The Digital Admin Marketplace"}
          </h1>
          <p className="text-blue-200 text-lg leading-relaxed">{tr.tagline}</p>
        </div>

        <div className="relative z-10 space-y-4">
          {[
            {
              icon: "shield",
              textEn: "Contract protection & substitute insurance",
              textFa: "حفاظت قرارداد و بیمه جایگزینی",
            },
            {
              icon: "check",
              textEn: "100% verified professionals",
              textFa: "۱۰۰٪ متخصصان تأییدشده",
            },
            {
              icon: "bot",
              textEn: "AI-powered matching & contract generation",
              textFa: "تطابق هوشمند و تولید قرارداد با هوش مصنوعی",
            },
          ].map((item) => (
            <div key={item.icon} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <Icon name={item.icon} size={16} className="text-white" />
              </div>
              <span className="text-blue-100 text-sm">
                {lang === "fa" ? item.textFa : item.textEn}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-12 bg-[#f2f5fa]">
        {/* Language switcher */}
        <div className="absolute top-6 end-6">
          <button
            onClick={() => setLang(lang === "fa" ? "en" : "fa")}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-[#e2e8f0] text-sm font-medium text-[#1e3a5f] hover:bg-[#f2f5fa] transition-colors shadow-sm"
          >
            <span className="text-base">{lang === "fa" ? "🇬🇧" : "🇮🇷"}</span>
            <span>{lang === "fa" ? "English" : "فارسی"}</span>
          </button>
        </div>

        <div className="max-w-md w-full mx-auto">
          {/* Logo on mobile */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-[#1e3a5f] flex items-center justify-center">
              <Icon name="bot" size={16} className="text-amber-400" />
            </div>
            <span className="text-lg font-bold text-[#1e3a5f]">{tr.brand}</span>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl bg-white border border-[#e2e8f0] p-1 mb-8 shadow-sm">
            {(["login", "register"] as const).map((t2) => (
              <button
                key={t2}
                onClick={() => setTab(t2)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all btn-press ${
                  tab === t2
                    ? "bg-[#1e3a5f] text-white shadow-sm"
                    : "text-[#64748b] hover:text-[#1e3a5f]"
                }`}
              >
                {t2 === "login" ? tr.auth.login : tr.auth.register}
              </button>
            ))}
          </div>

          <div className="fade-in">
            <h2 className="text-2xl font-bold text-[#0f172a] mb-1">
              {tab === "login" ? tr.auth.loginTitle : tr.auth.registerTitle}
            </h2>
            <p className="text-[#64748b] text-sm mb-8">
              {tab === "login" ? tr.auth.loginSub : tr.auth.registerSub}
            </p>

            {/* Role selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-[#0f172a] mb-3">
                {tr.auth.role}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["employer", "admin"] as Role[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={`p-4 rounded-xl border-2 text-start transition-all btn-press ${
                      role === r
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                        : "border-[#e2e8f0] bg-white hover:border-[#1e3a5f]/40"
                    }`}
                  >
                    <div
                      className={`text-sm font-bold mb-1 ${
                        role === r ? "text-[#1e3a5f]" : "text-[#0f172a]"
                      }`}
                    >
                      {r === "employer" ? tr.auth.employer : tr.auth.admin}
                    </div>
                    <div className="text-xs text-[#64748b] leading-snug">
                      {r === "employer"
                        ? tr.auth.employerDesc
                        : tr.auth.adminDesc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-4 mb-6">
              {tab === "register" && (
                <div>
                  <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                    {tr.auth.name}
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={tr.auth.namePh}
                    className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.auth.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={tr.auth.emailPh}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                  dir="ltr"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-[#0f172a]">
                    {tr.auth.password}
                  </label>
                  {tab === "login" && (
                    <button className="text-xs text-[#1e3a5f] hover:underline">
                      {tr.auth.forgotPw}
                    </button>
                  )}
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tr.auth.passwordPh}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                  dir="ltr"
                />
              </div>
            </div>

            <button
              onClick={() => onLogin(role)}
              className="w-full py-3.5 rounded-xl bg-[#1e3a5f] text-white font-bold text-sm hover:bg-[#122435] transition-colors shadow-md btn-press mb-4"
            >
              {tab === "login" ? tr.auth.login : tr.auth.register}
            </button>

            <button
              onClick={() => onLogin(role)}
              className="w-full py-3 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm hover:bg-[#f2f5fa] transition-colors btn-press"
            >
              {tr.auth.demo} →
            </button>

            <p className="text-center text-sm text-[#64748b] mt-6">
              {tab === "login" ? tr.auth.noAccount : tr.auth.haveAccount}{" "}
              <button
                onClick={() => setTab(tab === "login" ? "register" : "login")}
                className="text-[#1e3a5f] font-semibold hover:underline"
              >
                {tab === "login" ? tr.auth.register : tr.auth.login}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Employer Dashboard ───────────────────────────────────────────────────────

function EmployerDashboard() {
  const { tr, lang } = useApp()
  const [showSubModal, setShowSubModal] = useState(false)
  const fmt = (toman: number, usd: number) =>
    lang === "fa"
      ? `${(toman / 1000000).toFixed(1)}M ${tr.common.toman}`
      : `$${usd}`

  const stats = [
    {
      label: tr.dash.activeContracts,
      value: "3",
      icon: "contracts",
      color: "text-[#1e3a5f]",
      bg: "bg-[#1e3a5f]/10",
    },
    {
      label: tr.dash.savedAdmins,
      value: "12",
      icon: "profile",
      color: "text-sky-600",
      bg: "bg-sky-50",
    },
    {
      label: tr.dash.insurance,
      value: tr.dash.active,
      icon: "shield",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: tr.dash.totalSpent,
      value: lang === "fa" ? "48.5M تومان" : "$1,158",
      icon: "marketplace",
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
  ]

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.dash.hello}, {lang === "fa" ? "علی" : "Ali"} 👋
        </h1>
        <p className="text-[#64748b] mt-1">{tr.dash.overviewTitle}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-2xl p-5 border border-[#e2e8f0] card-hover"
          >
            <div
              className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mb-3`}
            >
              <Icon name={s.icon} size={20} className={s.color} />
            </div>
            <div className={`text-xl font-bold ${s.color} mb-0.5`}>
              {s.value}
            </div>
            <div className="text-xs text-[#64748b]">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Contracts */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-[#e2e8f0] overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0]">
            <h2 className="font-bold text-[#0f172a]">
              {tr.dash.recentContracts}
            </h2>
            <button className="text-xs text-[#1e3a5f] font-semibold hover:underline">
              {tr.dash.viewAll}
            </button>
          </div>
          <div className="divide-y divide-[#e2e8f0]">
            {CONTRACTS.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-[#f8fafc] transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#0f172a] truncate">
                      {lang === "fa" ? c.adminFa : c.adminEn}
                    </span>
                    <Badge platform={c.platform}>
                      {PLATFORM_LABELS[c.platform]}
                    </Badge>
                    {c.hasSubstitute && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-medium">
                        <Icon name="warning" size={10} />
                        {lang === "fa" ? "جایگزین فعال" : "Sub Active"}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#64748b]">
                    <span className="font-mono">{c.id}</span>
                    <span>
                      {fmt(c.amountToman, c.amountUSD)}/
                      {lang === "fa" ? "ماه" : "mo"}
                    </span>
                    {c.hasInsurance && (
                      <span className="flex items-center gap-1 text-emerald-600">
                        <Icon name="shield" size={11} />
                        {lang === "fa" ? "بیمه" : "Insured"}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                      c.status === "active"
                        ? "bg-emerald-100 text-emerald-700"
                        : c.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : c.status === "completed"
                            ? "bg-gray-100 text-gray-600"
                            : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tr.dash.status[(c.status as keyof typeof tr.dash.status)]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Insurance card */}
          <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8e] rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="shield" size={20} className="text-amber-400" />
              <span className="font-bold text-sm">{tr.dash.insTitle}</span>
            </div>
            <p className="text-blue-200 text-xs leading-relaxed mb-4">
              {tr.dash.insDesc}
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-xs font-semibold">
                {tr.dash.insActive}
              </span>
            </div>
          </div>

          {/* Request substitute */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <h3 className="font-bold text-sm text-[#0f172a] mb-3">
              {tr.dash.subStatus}
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <Icon
                  name="warning"
                  size={14}
                  className="text-orange-500 mt-0.5 flex-shrink-0"
                />
                <p className="text-xs text-orange-700 leading-relaxed">
                  {tr.dash.subActive}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSubModal(true)}
              className="w-full py-2.5 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#122435] transition-colors btn-press"
            >
              {tr.dash.requestSub}
            </button>
          </div>

          {/* Quick actions */}
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
            <h3 className="font-bold text-sm text-[#0f172a] mb-3">
              {tr.dash.quickActions}
            </h3>
            <div className="space-y-2">
              {[
                { label: tr.dash.findAdmin, icon: "search" },
                { label: tr.dash.newContract, icon: "contracts" },
                { label: tr.dash.manageInsurance, icon: "shield" },
              ].map((a) => (
                <button
                  key={a.label}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#1e3a5f] hover:bg-[#f2f5fa] transition-colors text-start font-medium"
                >
                  <Icon
                    name={a.icon}
                    size={16}
                    className="text-[#1e3a5f] flex-shrink-0"
                  />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Substitute Modal */}
      {showSubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Icon name="warning" size={20} className="text-orange-500" />
              </div>
              <h3 className="font-bold text-[#0f172a]">{tr.dash.requestSub}</h3>
            </div>
            <p className="text-sm text-[#64748b] mb-6 leading-relaxed">
              {tr.dash.subRequest}
            </p>
            <div className="bg-[#f2f5fa] rounded-xl p-4 mb-6">
              <div className="text-sm font-semibold text-[#0f172a] mb-2">
                {lang === "fa" ? "قرارداد مورد نظر:" : "Contract:"} C-1028
              </div>
              <div className="text-xs text-[#64748b]">
                {lang === "fa"
                  ? "سارا محمدی — واتساپ"
                  : "Sara Mohammadi — WhatsApp"}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748b] hover:bg-[#f2f5fa] transition-colors"
              >
                {tr.common.cancel}
              </button>
              <button
                onClick={() => setShowSubModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors"
              >
                {lang === "fa" ? "تأیید درخواست" : "Confirm Request"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Admin Dashboard / Profile ─────────────────────────────────────────────────

function AdminDashboard() {
  const { tr, lang } = useApp()
  const [bio, setBio] = useState(
    lang === "fa"
      ? "متخصص مدیریت شبکه‌های اجتماعی با ۴ سال تجربه در اینستاگرام و تلگرام."
      : "Social media management specialist with 4+ years on Instagram and Telegram.",
  )
  const [selectedPlatforms, setSelectedPlatforms] = useState([
    "instagram",
    "telegram",
  ])
  const [activeTab, setActiveTab] =
    useState<"profile" | "pricing" | "verification">("profile")
  const [prices, setPrices] = useState({
    basic: "2500000",
    premium: "4000000",
    hourly: "150000",
  })

  const allPlatforms = [
    "instagram",
    "telegram",
    "whatsapp",
    "torob",
    "digikala",
    "linkedin",
  ]

  const togglePlatform = (p: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }

  const fmt = (val: string) =>
    lang === "fa"
      ? `${(parseInt(val) / 1000000).toFixed(1)}M ${tr.common.toman}`
      : `$${Math.round(parseInt(val) / 42000)}`

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.adminProfile.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.adminProfile.sub}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white border border-[#e2e8f0] rounded-xl p-1 mb-6 w-fit shadow-sm">
        {(["profile", "pricing", "verification"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all btn-press ${
              activeTab === tab
                ? "bg-[#1e3a5f] text-white"
                : "text-[#64748b] hover:text-[#1e3a5f]"
            }`}
          >
            {tab === "profile"
              ? tr.adminProfile.bio.split(" ")[0]
              : tab === "pricing"
                ? tr.adminProfile.pricing
                : lang === "fa"
                  ? "تأییدیه"
                  : "Verification"}
          </button>
        ))}
      </div>

      {activeTab === "profile" && (
        <div className="grid lg:grid-cols-3 gap-6 fade-in">
          <div className="lg:col-span-2 space-y-5">
            {/* Photo & Bio */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <div className="flex items-center gap-4 mb-5">
                <div className="relative">
                  <img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format"
                    alt="Profile"
                    className="w-16 h-16 rounded-2xl object-cover"
                  />
                  <button className="absolute -bottom-1 -end-1 w-6 h-6 bg-[#1e3a5f] rounded-full flex items-center justify-center">
                    <Icon name="camera" size={12} className="text-white" />
                  </button>
                </div>
                <div>
                  <div className="font-bold text-[#0f172a]">
                    {lang === "fa" ? "آریا احمدی" : "Arya Ahmadi"}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-semibold">
                      <Icon name="check" size={12} />
                      {lang === "fa" ? "تأییدشده" : "Verified"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-[#1e3a5f] font-semibold">
                      <Icon name="shield" size={12} />
                      {lang === "fa" ? "بیمه‌شده" : "Insured"}
                    </span>
                  </div>
                </div>
              </div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                {tr.adminProfile.bio}
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder={tr.adminProfile.bioPh}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
              />
            </div>

            {/* Platforms */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <h3 className="font-bold text-[#0f172a] mb-4">
                {tr.adminProfile.platforms}
              </h3>
              <div className="flex flex-wrap gap-2">
                {allPlatforms.map((p) => (
                  <button
                    key={p}
                    onClick={() => togglePlatform(p)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-press border-2 ${
                      selectedPlatforms.includes(p)
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                        : "border-[#e2e8f0] text-[#64748b] hover:border-[#1e3a5f]/40"
                    }`}
                  >
                    {selectedPlatforms.includes(p) && (
                      <Icon name="check" size={12} />
                    )}
                    {PLATFORM_LABELS[p]}
                  </button>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
              <h3 className="font-bold text-[#0f172a] mb-4">
                {tr.adminProfile.skills}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(lang === "fa"
                  ? [
                      "تولید محتوا",
                      "تولید ریلز",
                      "رشد فالوور",
                      "مدیریت کامنت",
                      "استراتژی محتوا",
                      "آنالیتیکس",
                    ]
                  : [
                      "Content Creation",
                      "Reels Production",
                      "Follower Growth",
                      "Comment Mgmt",
                      "Content Strategy",
                      "Analytics",
                    ]
                ).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-full bg-[#1e3a5f]/10 text-[#1e3a5f] text-xs font-semibold"
                  >
                    {skill}
                  </span>
                ))}
                <button className="flex items-center gap-1 px-3 py-1.5 rounded-full border-2 border-dashed border-[#e2e8f0] text-[#64748b] text-xs font-semibold hover:border-[#1e3a5f]/40 transition-colors">
                  <Icon name="plus" size={12} />
                  {lang === "fa" ? "افزودن" : "Add"}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Stats */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] p-5">
              {[
                {
                  label:
                    lang === "fa" ? "پروژه تکمیل شده" : "Completed Projects",
                  value: "47",
                },
                { label: lang === "fa" ? "امتیاز" : "Rating", value: "4.9 ⭐" },
                { label: lang === "fa" ? "نظرات" : "Reviews", value: "127" },
                {
                  label: lang === "fa" ? "میانگین پاسخ" : "Response Time",
                  value: lang === "fa" ? "۲ ساعت" : "2 hrs",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-2.5 border-b border-[#f2f5fa] last:border-0"
                >
                  <span className="text-xs text-[#64748b]">{s.label}</span>
                  <span className="text-sm font-bold text-[#0f172a]">
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            <button className="w-full py-3.5 rounded-xl bg-[#1e3a5f] text-white font-bold text-sm hover:bg-[#122435] transition-colors shadow-md btn-press">
              {tr.adminProfile.saveProfile}
            </button>
          </div>
        </div>
      )}

      {activeTab === "pricing" && (
        <div className="fade-in">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                key: "basic",
                label: tr.adminProfile.basic,
                desc:
                  lang === "fa"
                    ? "۳۰ پست در ماه + مدیریت روزانه"
                    : "30 posts/month + daily management",
                icon: "🌱",
              },
              {
                key: "premium",
                label: tr.adminProfile.premium,
                desc:
                  lang === "fa"
                    ? "همه چیز در پایه + ریلز و تبلیغات"
                    : "Everything in Basic + Reels & Ads",
                icon: "⭐",
                featured: true,
              },
              {
                key: "hourly",
                label: tr.adminProfile.hourly,
                desc:
                  lang === "fa"
                    ? "نرخ ساعتی انعطاف‌پذیر"
                    : "Flexible hourly rate",
                icon: "⏱️",
              },
            ].map((pkg) => (
              <div
                key={pkg.key}
                className={`rounded-2xl border-2 p-5 ${
                  pkg.featured
                    ? "border-[#1e3a5f] bg-[#1e3a5f]/5"
                    : "border-[#e2e8f0] bg-white"
                }`}
              >
                <div className="text-2xl mb-3">{pkg.icon}</div>
                <div
                  className={`font-bold text-sm mb-1 ${
                    pkg.featured ? "text-[#1e3a5f]" : "text-[#0f172a]"
                  }`}
                >
                  {pkg.label}
                </div>
                <div className="text-xs text-[#64748b] mb-4 leading-relaxed">
                  {pkg.desc}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={prices[(pkg.key as keyof typeof prices)]}
                    onChange={(e) =>
                      setPrices((p) => ({ ...p, [pkg.key]: e.target.value }))
                    }
                    className="flex-1 px-3 py-2 rounded-lg border border-[#e2e8f0] bg-white text-sm font-bold text-[#0f172a] text-center focus:border-[#1e3a5f] transition-all"
                    dir="ltr"
                  />
                </div>
                <div className="text-xs text-[#64748b] mt-2 text-center">
                  {fmt(prices[(pkg.key as keyof typeof prices)])}
                </div>
                {pkg.featured && (
                  <div className="mt-3 px-2 py-1 bg-amber-100 rounded-lg text-xs text-amber-700 font-semibold text-center">
                    {lang === "fa" ? "پیشنهاد ویژه" : "Most Popular"}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-[#64748b]">
            <Icon name="info" size={14} />
            <span>
              {lang === "fa"
                ? "قیمت‌ها به تومان. نمایش دلاری بر اساس نرخ ۴۲,۰۰۰ تومان محاسبه می‌شود."
                : "Prices in Toman. USD shown at 42,000 Toman rate."}
            </span>
          </div>
        </div>
      )}

      {activeTab === "verification" && (
        <div className="max-w-xl fade-in space-y-4">
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#1e3a5f]/10 flex items-center justify-center flex-shrink-0">
                <Icon name="shield" size={20} className="text-[#1e3a5f]" />
              </div>
              <div>
                <h3 className="font-bold text-[#0f172a]">
                  {tr.adminProfile.verification}
                </h3>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  {tr.adminProfile.verificationDesc}
                </p>
              </div>
            </div>
            <button className="w-full py-3 rounded-xl bg-[#1e3a5f] text-white font-bold text-sm btn-press hover:bg-[#122435] transition-colors">
              {tr.adminProfile.applyVerification}
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <Icon name="check" size={20} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#0f172a]">
                  {tr.adminProfile.insuranceEligibility}
                </h3>
                <p className="text-xs text-[#64748b] mt-1 leading-relaxed">
                  {tr.adminProfile.insuranceDesc}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-[#64748b]">
                    {tr.adminProfile.status}:
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                    <Icon name="check" size={12} />
                    {tr.adminProfile.eligible}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

function Marketplace() {
  const { tr, lang, setPage } = useApp()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [platform, setPlatform] = useState("all")
  const [sortBy, setSortBy] = useState("rating")
  const [verifiedOnly, setVerifiedOnly] = useState(false)

  const filtered = ADMINS.filter((a) => {
    const name = lang === "fa" ? a.nameFa : a.nameEn
    const bio = lang === "fa" ? a.bioFa : a.bioEn
    const query = search.toLowerCase()
    const matchSearch =
      !query ||
      name.toLowerCase().includes(query) ||
      bio.toLowerCase().includes(query)
    const matchPlatform = platform === "all" || a.platforms.includes(platform)
    const matchVerified = !verifiedOnly || a.verified
    return matchSearch && matchPlatform && matchVerified
  }).sort((a, b) =>
    sortBy === "rating" ? b.rating - a.rating : a.monthlyToman - b.monthlyToman,
  )

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0f172a]">{tr.market.title}</h1>
        <p className="text-[#64748b] mt-1">{tr.market.sub}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-4 mb-6 flex flex-wrap gap-3 items-center shadow-sm">
        <div className="flex-1 min-w-48 relative">
          <div className="absolute start-3 top-1/2 -translate-y-1/2 text-[#94a3b8]">
            <Icon name="search" size={16} />
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr.market.search}
            className="w-full ps-9 pe-4 py-2.5 rounded-xl border border-[#e2e8f0] bg-[#f8fafc] text-sm text-[#0f172a] placeholder-[#94a3b8] focus:border-[#1e3a5f] transition-all"
          />
        </div>
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
        >
          <option value="all">{tr.market.allPlatforms}</option>
          {[
            "instagram",
            "telegram",
            "whatsapp",
            "torob",
            "digikala",
            "linkedin",
          ].map((p) => (
            <option key={p} value={p}>
              {PLATFORM_LABELS[p]}
            </option>
          ))}
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-3 py-2.5 rounded-xl border border-[#e2e8f0] bg-white text-sm text-[#0f172a] focus:border-[#1e3a5f] transition-all"
        >
          <option value="rating">{tr.market.sortRating}</option>
          <option value="price">{tr.market.sortPrice}</option>
        </select>
        <button
          onClick={() => setVerifiedOnly(!verifiedOnly)}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-all btn-press ${
            verifiedOnly
              ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
              : "border-[#e2e8f0] text-[#64748b] hover:border-[#1e3a5f]/40"
          }`}
        >
          <Icon name="check" size={14} />
          {tr.market.verified}
        </button>
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((admin) => (
          <div
            key={admin.id}
            className="bg-white rounded-2xl border border-[#e2e8f0] p-5 card-hover"
          >
            {/* Header */}
            <div className="flex items-start gap-3 mb-4">
              <img
                src={`https://images.unsplash.com/${admin.photo}?w=64&h=64&fit=crop&auto=format`}
                alt={admin.nameEn}
                className="w-14 h-14 rounded-2xl object-cover bg-[#f2f5fa] flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="font-bold text-sm text-[#0f172a] truncate">
                    {lang === "fa" ? admin.nameFa : admin.nameEn}
                  </span>
                  <div className="flex gap-1 flex-shrink-0">
                    {admin.verified && (
                      <div
                        className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center verified-glow"
                        title="Verified"
                      >
                        <Icon
                          name="check"
                          size={11}
                          className="text-emerald-600"
                        />
                      </div>
                    )}
                    {admin.insured && (
                      <div
                        className="w-5 h-5 rounded-full bg-[#1e3a5f]/10 flex items-center justify-center"
                        title="Insured"
                      >
                        <Icon
                          name="shield"
                          size={11}
                          className="text-[#1e3a5f]"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Stars rating={admin.rating} />
                  <span className="text-xs font-bold text-[#0f172a]">
                    {admin.rating}
                  </span>
                  <span className="text-xs text-[#94a3b8]">
                    ({admin.reviews} {tr.market.reviews})
                  </span>
                </div>
              </div>
            </div>

            {/* Bio */}
            <p className="text-xs text-[#64748b] leading-relaxed mb-4 line-clamp-2">
              {lang === "fa" ? admin.bioFa : admin.bioEn}
            </p>

            {/* Platforms */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {admin.platforms.map((p) => (
                <Badge key={p} platform={p}>
                  {PLATFORM_LABELS[p]}
                </Badge>
              ))}
            </div>

            {/* Skills */}
            <div className="flex flex-wrap gap-1 mb-4">
              {(lang === "fa" ? admin.skillsFa : admin.skillsEn)
                .slice(0, 3)
                .map((s) => (
                  <span
                    key={s}
                    className="px-2 py-0.5 rounded-full bg-[#f2f5fa] text-[#64748b] text-xs"
                  >
                    {s}
                  </span>
                ))}
            </div>

            {/* Price & CTA */}
            <div className="border-t border-[#f2f5fa] pt-4 flex items-center justify-between">
              <div>
                <div className="text-xs text-[#64748b]">
                  {tr.market.starting}
                </div>
                <div className="text-base font-bold text-[#1e3a5f]">
                  {lang === "fa"
                    ? `${(admin.monthlyToman / 1000000).toFixed(1)}M ${tr.common.toman}`
                    : `$${admin.monthlyUSD}`}
                  <span className="text-xs font-normal text-[#94a3b8]">
                    {tr.market.perMonth}
                  </span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/admin/${admin.id}`)}
                className="px-4 py-2 rounded-xl bg-[#1e3a5f] text-white text-xs font-bold hover:bg-[#122435] transition-colors btn-press"
              >
                {tr.market.viewProfile}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-[#64748b]">
          <div className="text-4xl mb-3">🔍</div>
          <div className="font-semibold">
            {lang === "fa" ? "نتیجه‌ای یافت نشد" : "No results found"}
          </div>
          <div className="text-sm mt-1">
            {lang === "fa"
              ? "فیلترها را تغییر دهید"
              : "Try adjusting your filters"}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Contract Generator ───────────────────────────────────────────────────────

function ContractGenerator() {
  const { tr, lang } = useApp()
  const [step, setStep] = useState(1)
  const totalSteps = 5
  const [form, setForm] = useState({
    employerName: lang === "fa" ? "علی رضایی" : "Ali Rezaei",
    employerCo: lang === "fa" ? "استارتاپ پارسه" : "Parseh Startup",
    adminName: lang === "fa" ? "آریا احمدی" : "Arya Ahmadi",
    projectTitle:
      lang === "fa"
        ? "مدیریت صفحه اینستاگرام برند"
        : "Brand Instagram Page Management",
    startDate: "2026-09-01",
    endDate: "2026-12-01",
    description:
      lang === "fa"
        ? "مدیریت کامل صفحه اینستاگرام برند شامل تولید محتوا، پست‌گذاری روزانه، پاسخ به کامنت‌ها و گزارش‌دهی هفتگی."
        : "Full management of brand Instagram including content creation, daily posting, comment replies and weekly reporting.",
    deliverables:
      lang === "fa"
        ? "۳۰ پست در ماه\n۱۰۰ استوری در ماه\nگزارش هفتگی آنالیتیکس\nمدیریت روزانه DM‌ها"
        : "30 posts/month\n100 stories/month\nWeekly analytics report\nDaily DM management",
    payType: "monthly",
    amount: lang === "fa" ? "4500000" : "108",
    currency: lang === "fa" ? "toman" : "usd",
    paySchedule: "payMonthly",
    termClause: tr.contract.termDefault,
    subClause: tr.contract.subDefault,
  })

  const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))
  const steps = [
    tr.contract.step1,
    tr.contract.step2,
    tr.contract.step3,
    tr.contract.step4,
    tr.contract.step5,
  ]

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">
          {tr.contract.title}
        </h1>
        <p className="text-[#64748b] mt-1">{tr.contract.sub}</p>
      </div>

      {/* Step indicators */}
      <div className="flex items-center mb-8">
        {steps.map((label, i) => (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  i + 1 < step
                    ? "bg-emerald-500 text-white"
                    : i + 1 === step
                      ? "bg-[#1e3a5f] text-white"
                      : "bg-[#e2e8f0] text-[#94a3b8]"
                }`}
              >
                {i + 1 < step ? <Icon name="check" size={14} /> : i + 1}
              </div>
              <div
                className={`text-xs mt-1 font-medium hidden sm:block ${
                  i + 1 === step ? "text-[#1e3a5f]" : "text-[#94a3b8]"
                }`}
              >
                {label}
              </div>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`step-connector mx-1 mt-0 sm:-mt-4 ${
                  i + 1 < step ? "active" : ""
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 mb-6">
        {step === 1 && (
          <div className="space-y-5 fade-in">
            <h2 className="font-bold text-[#0f172a] text-lg">
              {tr.contract.step1}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.employerName}
                </label>
                <input
                  value={form.employerName}
                  onChange={(e) => setF("employerName", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.employerCo}
                </label>
                <input
                  value={form.employerCo}
                  onChange={(e) => setF("employerCo", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.contract.adminName}
              </label>
              <input
                value={form.adminName}
                onChange={(e) => setF("adminName", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 fade-in">
            <h2 className="font-bold text-[#0f172a] text-lg">
              {tr.contract.step2}
            </h2>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.contract.projectTitle}
              </label>
              <input
                value={form.projectTitle}
                onChange={(e) => setF("projectTitle", e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.startDate}
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setF("startDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.endDate}
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setF("endDate", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all"
                  dir="ltr"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.contract.description}
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setF("description", e.target.value)}
                placeholder={tr.contract.descPh}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.contract.deliverables}
              </label>
              <textarea
                value={form.deliverables}
                onChange={(e) => setF("deliverables", e.target.value)}
                placeholder={tr.contract.delivPh}
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] focus:ring-2 focus:ring-[#1e3a5f]/20 transition-all resize-none font-mono text-xs"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 fade-in">
            <h2 className="font-bold text-[#0f172a] text-lg">
              {tr.contract.step3}
            </h2>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                {tr.contract.payType}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["monthly", "hourly", "project"] as const).map((pt) => (
                  <button
                    key={pt}
                    onClick={() => setF("payType", pt)}
                    className={`py-2.5 rounded-xl text-xs font-bold border-2 transition-all btn-press ${
                      form.payType === pt
                        ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                        : "border-[#e2e8f0] text-[#64748b]"
                    }`}
                  >
                    {tr.contract[pt]}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.amount}
                </label>
                <input
                  value={form.amount}
                  onChange={(e) => setF("amount", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all"
                  dir="ltr"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                  {tr.contract.currency}
                </label>
                <select
                  value={form.currency}
                  onChange={(e) => setF("currency", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all bg-white"
                >
                  <option value="toman">{tr.contract.toman}</option>
                  <option value="usd">{tr.contract.usd}</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-2">
                {tr.contract.paySchedule}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["weekly", "biweekly", "payMonthly", "upfront"] as const).map(
                  (ps) => (
                    <button
                      key={ps}
                      onClick={() => setF("paySchedule", ps)}
                      className={`py-2 rounded-xl text-xs font-semibold border-2 transition-all btn-press ${
                        form.paySchedule === ps
                          ? "border-[#1e3a5f] bg-[#1e3a5f]/5 text-[#1e3a5f]"
                          : "border-[#e2e8f0] text-[#64748b]"
                      }`}
                    >
                      {tr.contract[ps]}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-5 fade-in">
            <h2 className="font-bold text-[#0f172a] text-lg">
              {tr.contract.step4}
            </h2>
            <div>
              <label className="block text-sm font-semibold text-[#0f172a] mb-1.5">
                {tr.contract.termClause}
              </label>
              <textarea
                value={form.termClause}
                onChange={(e) => setF("termClause", e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-[#e2e8f0] text-sm focus:border-[#1e3a5f] transition-all resize-none text-[#64748b] leading-relaxed"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <label className="text-sm font-semibold text-[#0f172a]">
                  {tr.contract.subClause}
                </label>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold flex items-center gap-1">
                  <Icon name="shield" size={11} />
                  {lang === "fa" ? "بیمه ادمین‌هاب" : "AdminHub Insurance"}
                </span>
              </div>
              <textarea
                value={form.subClause}
                onChange={(e) => setF("subClause", e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-sm focus:border-emerald-400 transition-all resize-none text-[#64748b] leading-relaxed"
              />
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="fade-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[#0f172a] text-lg">
                {tr.contract.contractPreview}
              </h2>
              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                {lang === "fa" ? "آماده برای امضا" : "Ready for Signing"}
              </span>
            </div>
            <div className="bg-[#f8fafc] rounded-xl border border-[#e2e8f0] p-6 text-sm leading-relaxed text-[#0f172a] font-mono space-y-4 max-h-80 overflow-y-auto">
              <div className="text-center font-bold text-base text-[#1e3a5f] pb-4 border-b border-[#e2e8f0]">
                {tr.contract.partiesTitle}
              </div>
              <p>
                {tr.contract.between} <strong>{form.employerName}</strong>{" "}
                {form.employerCo ? `(${form.employerCo})` : ""},{" "}
                {tr.contract.partyEmployer},<br />
                {tr.contract.and} <strong>{form.adminName}</strong>,{" "}
                {tr.contract.partyAdmin}.
              </p>
              <p>
                <strong>{lang === "fa" ? "پروژه:" : "Project:"}</strong>{" "}
                {form.projectTitle}
              </p>
              <p>
                <strong>{lang === "fa" ? "مدت:" : "Duration:"}</strong>{" "}
                {form.startDate} → {form.endDate}
              </p>
              <p>
                <strong>{lang === "fa" ? "توضیحات:" : "Description:"}</strong>
                <br />
                {form.description}
              </p>
              <p>
                <strong>{lang === "fa" ? "تحویلی‌ها:" : "Deliverables:"}</strong>
                <br />
                {form.deliverables.split("\n").map((d, i) => (
                  <span key={i}>
                    • {d}
                    <br />
                  </span>
                ))}
              </p>
              <p>
                <strong>{lang === "fa" ? "پرداخت:" : "Payment:"}</strong>{" "}
                {form.amount}{" "}
                {form.currency === "toman"
                  ? tr.contract.toman
                  : tr.contract.usd}
              </p>
              <p>
                <strong>{lang === "fa" ? "بند فسخ:" : "Termination:"}</strong>
                <br />
                {form.termClause}
              </p>
              <p>
                <strong>
                  {lang === "fa"
                    ? "بیمه و جایگزینی:"
                    : "Substitution & Insurance:"}
                </strong>
                <br />
                {form.subClause}
              </p>
            </div>
            <div className="mt-4 grid sm:grid-cols-2 gap-3">
              <button className="py-3 rounded-xl border-2 border-[#1e3a5f] text-[#1e3a5f] text-sm font-bold hover:bg-[#1e3a5f]/5 transition-colors btn-press">
                {tr.contract.downloadPdf}
              </button>
              <button className="py-3 rounded-xl bg-emerald-500 text-white text-sm font-bold hover:bg-emerald-600 transition-colors shadow-md btn-press">
                {tr.contract.sendForSigning}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#e2e8f0] text-sm font-semibold text-[#64748b] hover:bg-[#f2f5fa] disabled:opacity-40 disabled:cursor-not-allowed transition-all btn-press"
        >
          <Icon name="chevronLeft" size={16} className="rtl:rotate-180" />
          {tr.contract.prev}
        </button>
        {step < totalSteps ? (
          <button
            onClick={() => setStep(Math.min(totalSteps, step + 1))}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1e3a5f] text-white text-sm font-bold hover:bg-[#122435] transition-colors shadow-md btn-press"
          >
            {tr.contract.next}
            <Icon name="chevronRight" size={16} className="rtl:rotate-180" />
          </button>
        ) : null}
      </div>
    </div>
  )
}

// ─── Placeholder Page ─────────────────────────────────────────────────────────

function PlaceholderPage({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">{title}</h1>
        <p className="text-[#64748b] mt-1">{subtitle}</p>
      </div>
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <div className="font-bold text-[#0f172a] mb-1">Coming Soon</div>
        <div className="text-sm text-[#64748b]">
          This page is under construction.
        </div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [lang, setLang] = useState<Lang>("fa")
  const [isAuth, setIsAuth] = useState(false)
  const [role, setRole] = useState<Role>("employer")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const dir = lang === "fa" ? "rtl" : "ltr"
  const tr = t[lang]

  const page = (
    pathname === "/marketplace"
      ? "marketplace"
      : pathname === "/tools-rental"
        ? "toolsRental"
        : pathname === "/editors"
          ? "editors"
          : pathname === "/vibe-coders"
            ? "vibeCoders"
            : pathname === "/skills"
              ? "skills"
              : pathname === "/contracts"
                ? "contracts"
                : pathname.startsWith("/ai")
                  ? "ai"
                  : pathname === "/packages"
                    ? "packages"
                    : pathname === "/compare"
                      ? "compare"
                      : pathname === "/profile"
                        ? "profile"
                        : "dashboard"
  ) as Page

  const navItems: {
    id: Page
    icon: string
    label: string
  }[] = [
    { id: "dashboard", icon: "dashboard", label: tr.nav.dashboard },
    { id: "marketplace", icon: "marketplace", label: tr.nav.marketplace },
    { id: "toolsRental", icon: "camera", label: tr.nav.toolsRental },
    { id: "editors", icon: "edit", label: tr.nav.editors },
    { id: "vibeCoders", icon: "bot", label: tr.nav.vibeCoders },
    { id: "skills", icon: "chart", label: tr.nav.skills },
    { id: "contracts", icon: "contracts", label: tr.nav.contracts },
    ...(role === "admin"
      ? [{ id: "packages" as Page, icon: "package", label: tr.nav.packages }]
      : []),
    ...(role === "employer"
      ? [{ id: "compare" as Page, icon: "compare", label: tr.nav.compare }]
      : []),
    { id: "ai", icon: "ai", label: tr.nav.ai },
    { id: "profile", icon: "profile", label: tr.nav.profile },
  ]

  const pageTitle =
    page === "dashboard"
      ? tr.nav.dashboard
      : page === "marketplace"
        ? tr.nav.marketplace
        : page === "toolsRental"
          ? tr.nav.toolsRental
          : page === "editors"
            ? tr.nav.editors
            : page === "vibeCoders"
              ? tr.nav.vibeCoders
              : page === "skills"
                ? tr.nav.skills
                : page === "contracts"
                  ? tr.nav.contracts
                  : page === "packages"
                    ? tr.nav.packages
                    : page === "compare"
                      ? tr.nav.compare
                      : page === "ai"
                        ? tr.nav.ai
                        : tr.nav.profile

  const ctx: AppCtx = {
    lang,
    setLang,
    role,
    page,
    setPage: (p: Page) => navigate(`/${p === "dashboard" ? "" : p}`),
    tr,
    dir,
  }

  const handleLogin = (r: Role) => {
    setRole(r)
    setIsAuth(true)
    navigate("/dashboard")
  }

  const handleLogout = () => {
    setIsAuth(false)
    navigate("/")
    setMobileMenuOpen(false)
  }

  if (!isAuth) {
    return (
      <Ctx.Provider value={ctx}>
        <AuthPage onLogin={handleLogin} />
      </Ctx.Provider>
    )
  }

  return (
    <Ctx.Provider value={ctx}>
      <div className="flex h-screen bg-[#f2f5fa] overflow-hidden" dir={dir}>
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-col flex-shrink-0 w-64 h-full">
          <Sidebar role={role} onLogout={handleLogout} navItems={navItems} />
        </div>

        {/* Mobile Sidebar overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex" dir={dir}>
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative z-10 w-72 h-full">
              <Sidebar
                role={role}
                onLogout={handleLogout}
                mobile
                onClose={() => setMobileMenuOpen(false)}
                navItems={navItems}
              />
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Mobile topbar */}
          <MobileTopbar
            pageTitle={pageTitle}
            lang={lang}
            onToggleLang={() => setLang(lang === "fa" ? "en" : "fa")}
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
            userName={lang === "fa" ? "علی" : "Ali"}
            userInitial={lang === "fa" ? "ع" : "A"}
            theme={theme}
            onToggleTheme={toggleTheme}
            fontSize={fontSize}
            onChangeFontSize={setFontSize}
          />

          {/* Desktop topbar */}
          <Topbar
            pageTitle={pageTitle}
            lang={lang}
            onToggleLang={() => setLang(lang === "fa" ? "en" : "fa")}
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
            userName={lang === "fa" ? "علی" : "Ali"}
            userInitial={lang === "fa" ? "ع" : "A"}
            theme={theme}
            onToggleTheme={toggleTheme}
            fontSize={fontSize}
            onChangeFontSize={setFontSize}
          />

          {/* Page routes */}
          <Routes>
            <Route
              path="/"
              element={
                <div className="flex-1 overflow-y-auto">
                  {role === "employer" ? (
                    <EmployerDashboard />
                  ) : (
                    <AdminDashboard />
                  )}
                </div>
              }
            />
            <Route
              path="/marketplace"
              element={
                <div className="flex-1 overflow-y-auto">
                  <Marketplace />
                </div>
              }
            />
            <Route
              path="/tools-rental"
              element={
                <div className="flex-1 overflow-y-auto">
                  <ToolsRentalPage tr={tr} lang={lang} />
                </div>
              }
            />
            <Route
              path="/editors"
              element={
                <div className="flex-1 overflow-y-auto">
                  <EditorsPage tr={tr} lang={lang} />
                </div>
              }
            />
            <Route
              path="/vibe-coders"
              element={
                <div className="flex-1 overflow-y-auto">
                  <VibeCodersPage tr={tr} lang={lang} />
                </div>
              }
            />
            <Route
              path="/skills"
              element={
                <div className="flex-1 overflow-y-auto">
                  <PlaceholderPage
                    title={tr.nav.skills}
                    subtitle={
                      lang === "fa"
                        ? "بزودی قابل استفاده خواهد بود"
                        : "Coming soon"
                    }
                  />
                </div>
              }
            />
            <Route
              path="/contracts"
              element={
                <div className="flex-1 overflow-y-auto">
                  <ContractGenerator />
                </div>
              }
            />
            <Route
              path="/packages"
              element={
                <div className="flex-1 overflow-y-auto">
                  <AdminPackagesPage />
                </div>
              }
            />
            <Route
              path="/admin/:adminId"
              element={
                <div className="flex-1 overflow-y-auto">
                  <AdminPublicProfilePage />
                </div>
              }
            />
            <Route
              path="/compare"
              element={
                <div className="flex-1 overflow-y-auto">
                  <PackageComparisonPage />
                </div>
              }
            />
            <Route
              path="/ai"
              element={
                <div className="flex-1 overflow-hidden flex flex-col">
                  <AiPage />
                </div>
              }
            />
            <Route
              path="/ai/:conversationId"
              element={
                <div className="flex-1 overflow-hidden flex flex-col">
                  <AiPage />
                </div>
              }
            />
            <Route
              path="/profile"
              element={
                <div className="flex-1 overflow-y-auto">
                  {role === "admin" ? (
                    <AdminDashboard />
                  ) : (
                    <EmployerDashboard />
                  )}
                </div>
              }
            />
          </Routes>
        </div>
      </div>
    </Ctx.Provider>
  )
}
