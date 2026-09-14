import { useState, useEffect, createContext, useContext } from "react"
import {
  useLocation,
  useNavigate,
  Navigate,
  Routes,
  Route,
} from "react-router-dom"
import { t, type Lang, type Tr } from "./i18n"
import { Icon } from "./components/layout/Icon"
import { Sidebar } from "./components/layout/Sidebar"
import { Topbar, MobileTopbar } from "./components/layout/Topbar"
import { Stars } from "./components/platform/Stars"
import { Badge } from "./components/ui/Badge"
import { useTheme } from "./design-system/ThemeProvider"
import { useAuth } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import AdminPackagesPage from "./pages/AdminPackagesPage"
import AdminPublicProfilePage from "./pages/AdminPublicProfilePage"
import WalletPage from "./pages/WalletPage"
import AdminUsersPage from "./pages/AdminUsersPage"
import AdminContentModerationPage from "./pages/AdminContentModerationPage"
import AdminTicketsPage from "./pages/AdminTicketsPage"
import AdminWorkspacePage from "./pages/AdminWorkspacePage"
import AdminPortfolioPage from "./pages/AdminPortfolioPage"
import PackageComparisonPage from "./pages/PackageComparisonPage"
import ContractGenerator from "./pages/ContractGenerator"
import ContractsPage from "./pages/ContractsPage"
import TicketsPage from "./pages/TicketsPage"
import ToolsRentalPage from "./pages/ToolsRentalPage"
import EditorsPage from "./pages/EditorsPage"
import VibeCodersPage from "./pages/VibeCodersPage"
import AiPage from "./pages/AiPage"
import AuthPage from "./pages/AuthPage"
import EmployerDashboard from "./components/dashboard/EmployerDashboard"
import AdminDashboard from "./components/dashboard/AdminDashboard"
import Marketplace from "./pages/Marketplace"

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "employer" | "admin" | "super_admin"
type Page = "dashboard" | "marketplace" | "toolsRental" | "editors" | "vibeCoders" | "skills" | "contracts" | "contractsHistory" | "tickets" | "ai" | "profile" | "packages" | "compare" | "adminUsers" | "adminContent" | "adminTickets" | "adminWorkspace" | "adminPortfolio" | "wallet"

interface AppCtx {
  lang: Lang
  setLang: (l: Lang) => void
  role: Role
  page: Page
  setPage: (p: Page) => void
  tr: Tr
  dir: "ltr" | "rtl"
}

const Ctx = createContext<AppCtx>({
  lang: "en",
  setLang: () => {},
  role: "employer",
  page: "dashboard",
  setPage: () => {},
  tr: t.en,
  dir: "ltr",
})
export const useApp = () => useContext(Ctx)

// ─── Route metadata ──────────────────────────────────────────────────────────

/** Canonical route for each page id (kebab-case paths, matching <Routes>). */
export const PAGE_ROUTES: Record<Page, string> = {
  dashboard: "/",
  marketplace: "/marketplace",
  toolsRental: "/tools-rental",
  editors: "/editors",
  vibeCoders: "/vibe-coders",
  skills: "/skills",
  contracts: "/contracts",
  contractsHistory: "/contracts/history",
  tickets: "/tickets",
  ai: "/ai",
  profile: "/profile",
  packages: "/packages",
  compare: "/compare",
  adminUsers: "/admin-users",
  adminContent: "/admin-content",
  adminTickets: "/admin-tickets",
  adminWorkspace: "/admin-workspace",
  adminPortfolio: "/admin-portfolio",
  wallet: "/wallet",
}

const ROUTE_META: Record<string, { page: Page; titleKey?: string }> = {
  "/marketplace": { page: "marketplace", titleKey: "marketplace" },
  "/tools-rental": { page: "toolsRental", titleKey: "toolsRental" },
  "/editors": { page: "editors", titleKey: "editors" },
  "/vibe-coders": { page: "vibeCoders", titleKey: "vibeCoders" },
  "/skills": { page: "skills", titleKey: "skills" },
  "/contracts": { page: "contracts", titleKey: "contracts" },
  "/contracts/history": {
    page: "contractsHistory",
    titleKey: "contractsHistory",
  },
  "/tickets": { page: "tickets", titleKey: "tickets" },
  "/packages": { page: "packages", titleKey: "packages" },
  "/admin-users": { page: "adminUsers", titleKey: "adminUsers" },
  "/admin-content": { page: "adminContent", titleKey: "adminContent" },
  "/admin-tickets": { page: "adminTickets", titleKey: "adminTickets" },
  "/admin-workspace": { page: "adminWorkspace", titleKey: "adminWorkspace" },
  "/admin-portfolio": { page: "adminPortfolio", titleKey: "adminPortfolio" },
  "/compare": { page: "compare", titleKey: "compare" },
  "/ai": { page: "ai", titleKey: "ai" },
  "/profile": { page: "profile", titleKey: "profile" },
  "/wallet": { page: "wallet", titleKey: "wallet" },
  "/dashboard": { page: "dashboard", titleKey: "dashboard" },
  "/admin/users": { page: "adminUsers", titleKey: "adminUsers" },
  "/admin/content": { page: "adminContent", titleKey: "adminContent" },
  "/admin/tickets": { page: "adminTickets", titleKey: "adminTickets" },
  "/admin/workspace": { page: "adminWorkspace", titleKey: "adminWorkspace" },
  "/admin/portfolio": { page: "adminPortfolio", titleKey: "adminPortfolio" },
  "/": { page: "dashboard", titleKey: "dashboard" },
}

function getPageMeta(
  pathname: string,
  lang: Lang,
  tr: Tr,
): { page: Page; title: string } {
  const exactMatch = ROUTE_META[pathname]
  if (exactMatch) {
    const meta = exactMatch
    const title = meta.titleKey
      ? tr.nav[(meta.titleKey as keyof typeof tr.nav)] || tr.nav.dashboard
      : tr.nav.dashboard
    return { page: meta.page, title }
  }

  if (pathname.startsWith("/tickets")) {
    return { page: "tickets", title: tr.tickets.title }
  }
  if (pathname.startsWith("/ai")) {
    return { page: "ai", title: tr.nav.ai }
  }
  if (pathname.startsWith("/admin/")) {
    return { page: "adminUsers", title: tr.adminUsers.title }
  }

  return { page: "dashboard", title: tr.nav.dashboard }
}

// ─── Placeholder Page ─────────────────────────────────────────────────────────

function PlaceholderPage({
  title,
  subtitle,
  comingSoon,
  underConstruction,
}: {
  title: string
  subtitle: string
  comingSoon: string
  underConstruction: string
}) {
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto fade-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#0f172a]">{title}</h1>
        <p className="text-[#64748b] mt-1">{subtitle}</p>
      </div>
      <div className="bg-white rounded-2xl border border-[#e2e8f0] p-12 text-center">
        <div className="text-4xl mb-4">🚧</div>
        <div className="font-bold text-[#0f172a] mb-1">{comingSoon}</div>
        <div className="text-sm text-[#64748b]">{underConstruction}</div>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

import { ErrorBoundary } from "./components/ui/ErrorBoundary"

export default function App() {
  const { theme, toggleTheme, fontSize, setFontSize, lang, setLang } =
    useTheme()
  const { user, isLoading, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // A 401 from any request clears the session; send the user back to sign-in.
  useEffect(() => {
    const onUnauthorized = () => {
      void logout()
      navigate("/auth", { replace: true })
    }
    window.addEventListener("adminhub:unauthorized", onUnauthorized)
    return () =>
      window.removeEventListener("adminhub:unauthorized", onUnauthorized)
  }, [logout, navigate])

  const dir = lang === "fa" ? "rtl" : "ltr"
  const tr = t[lang]
  const role = user?.role as Role || "employer"

  const { page, title: pageTitle } = getPageMeta(pathname, lang, tr)

  const navItems: {
    id: Page
    icon: string
    label: string
    path: string
  }[] = [
    {
      id: "dashboard",
      icon: "dashboard",
      label: tr.nav.dashboard,
      path: PAGE_ROUTES.dashboard,
    },
    {
      id: "marketplace",
      icon: "marketplace",
      label: tr.nav.marketplace,
      path: PAGE_ROUTES.marketplace,
    },
    {
      id: "toolsRental",
      icon: "camera",
      label: tr.nav.toolsRental,
      path: PAGE_ROUTES.toolsRental,
    },
    {
      id: "editors",
      icon: "edit",
      label: tr.nav.editors,
      path: PAGE_ROUTES.editors,
    },
    {
      id: "vibeCoders",
      icon: "bot",
      label: tr.nav.vibeCoders,
      path: PAGE_ROUTES.vibeCoders,
    },
    {
      id: "skills",
      icon: "chart",
      label: tr.nav.skills,
      path: PAGE_ROUTES.skills,
    },
    {
      id: "contracts",
      icon: "contracts",
      label: tr.nav.contracts,
      path: PAGE_ROUTES.contracts,
    },
    ...(role === "admin"
      ? [
          {
            id: "packages" as Page,
            icon: "package",
            label: tr.nav.packages,
            path: PAGE_ROUTES.packages,
          },
          {
            id: "adminUsers" as Page,
            icon: "users",
            label: tr.adminUsers.title,
            path: PAGE_ROUTES.adminUsers,
          },
          {
            id: "adminContent" as Page,
            icon: "edit",
            label: tr.adminContent.title,
            path: PAGE_ROUTES.adminContent,
          },
          {
            id: "adminTickets" as Page,
            icon: "tickets",
            label: tr.adminTickets.title,
            path: PAGE_ROUTES.adminTickets,
          },
          {
            id: "adminWorkspace" as Page,
            icon: "layers",
            label: tr.adminWorkspace.title,
            path: PAGE_ROUTES.adminWorkspace,
          },
          {
            id: "adminPortfolio" as Page,
            icon: "camera",
            label: tr.adminPortfolio.title,
            path: PAGE_ROUTES.adminPortfolio,
          },
        ]
      : []),
    ...(role === "employer"
      ? [
          {
            id: "compare" as Page,
            icon: "compare",
            label: tr.nav.compare,
            path: PAGE_ROUTES.compare,
          },
        ]
      : []),
    { id: "ai", icon: "ai", label: tr.nav.ai, path: PAGE_ROUTES.ai },
    {
      id: "wallet",
      icon: "wallet",
      label: tr.nav.wallet,
      path: PAGE_ROUTES.wallet,
    },
    {
      id: "profile",
      icon: "profile",
      label: tr.nav.profile,
      path: PAGE_ROUTES.profile,
    },
  ]

  const ctx: AppCtx = {
    lang,
    setLang,
    role,
    page,
    setPage: (p: Page) => navigate(PAGE_ROUTES[p] ?? "/"),
    tr,
    dir,
  }

  const handleLogin = (_r: Role) => {
    navigate("/")
  }

  const handleLogout = async () => {
    await logout()
    navigate("/auth", { replace: true })
    setMobileMenuOpen(false)
  }

  if (user && pathname === "/auth") {
    return <Navigate to="/" replace />
  }

  if (!user && !isLoading) {
    return (
      <Ctx.Provider value={ctx}>
        <AuthPage lang={lang} tr={tr} dir={dir} setLang={setLang} />
      </Ctx.Provider>
    )
  }

  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <ErrorBoundary>
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
              userName={
                lang === "fa" ? user?.nameFa || "علی" : user?.nameEn || "Ali"
              }
              userInitial={
                lang === "fa"
                  ? user?.nameFa?.charAt(0) || "ع"
                  : user?.nameEn?.charAt(0) || "A"
              }
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
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      {role === "employer" ? (
                        <EmployerDashboard lang={lang} tr={tr} role={role} />
                      ) : (
                        <AdminDashboard lang={lang} tr={tr} />
                      )}
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <Marketplace lang={lang} tr={tr} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tools-rental"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <ToolsRentalPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/editors"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <EditorsPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vibe-coders"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <VibeCodersPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/skills"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <PlaceholderPage
                        title={tr.nav.skills}
                        subtitle={tr.skills.sub}
                        comingSoon={tr.common.comingSoon}
                        underConstruction={tr.common.underConstruction}
                      />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contracts"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <ContractGenerator tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contracts/history"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <ContractsPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <TicketsPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/tickets/:ticketId"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <TicketsPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/packages"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <AdminPackagesPage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-users"
                element={
                  <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                    <div className="flex-1 overflow-y-auto">
                      <AdminUsersPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-content"
                element={
                  <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                    <div className="flex-1 overflow-y-auto">
                      <AdminContentModerationPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-tickets"
                element={
                  <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                    <div className="flex-1 overflow-y-auto">
                      <AdminTicketsPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-workspace"
                element={
                  <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                    <div className="flex-1 overflow-y-auto">
                      <AdminWorkspacePage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin-portfolio"
                element={
                  <ProtectedRoute allowedRoles={["admin", "super_admin"]}>
                    <div className="flex-1 overflow-y-auto">
                      <AdminPortfolioPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/:adminId"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <AdminPublicProfilePage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compare"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <PackageComparisonPage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <AiPage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/ai/:conversationId"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-hidden flex flex-col">
                      <AiPage />
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      {role === "employer" ? (
                        <EmployerDashboard lang={lang} tr={tr} role={role} />
                      ) : (
                        <AdminDashboard lang={lang} tr={tr} />
                      )}
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wallet"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      <WalletPage tr={tr} lang={lang} />
                    </div>
                  </ProtectedRoute>
                }
              />
              {([
                "/admin/users",
                "/admin/content",
                "/admin/tickets",
                "/admin/workspace",
                "/admin/portfolio",
              ] as const).map((alias) => (
                <Route
                  key={alias}
                  path={alias}
                  element={
                    <Navigate
                      to={alias.replace("/admin/", "/admin-")}
                      replace
                    />
                  }
                />
              ))}
              <Route
                path="*"
                element={
                  <div className="flex-1 overflow-y-auto">
                    <PlaceholderPage
                      title="404"
                      subtitle={
                        lang === "fa"
                          ? "صفحه‌ای که دنبال آن بودید پیدا نشد"
                          : "The page you were looking for was not found"
                      }
                      comingSoon={tr.common.underConstruction}
                      underConstruction={tr.common.back}
                    />
                  </div>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <div className="flex-1 overflow-y-auto">
                      {role === "admin" ? (
                        <AdminDashboard lang={lang} tr={tr} />
                      ) : (
                        <EmployerDashboard lang={lang} tr={tr} role={role} />
                      )}
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>
      </Ctx.Provider>
    </ErrorBoundary>
  )
}
