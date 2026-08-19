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
import { useAuth } from "./contexts/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import AdminPackagesPage from "./pages/AdminPackagesPage"
import AdminPublicProfilePage from "./pages/AdminPublicProfilePage"
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
type Page = "dashboard" | "marketplace" | "toolsRental" | "editors" | "vibeCoders" | "skills" | "contracts" | "contractsHistory" | "tickets" | "ai" | "profile" | "packages" | "compare" | "adminUsers" | "adminContent" | "adminTickets" | "adminWorkspace" | "adminPortfolio"

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

import { ErrorBoundary } from "./components/ui/ErrorBoundary"

export default function App() {
  const { theme, toggleTheme, fontSize, setFontSize } = useTheme()
  const { user, isLoading, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [lang, setLang] = useState<Lang>("fa")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const dir = lang === "fa" ? "rtl" : "ltr"
  const tr = t[lang]
  const role = (user?.role as Role) || "employer"

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
                : pathname === "/contracts/history"
                  ? "contractsHistory"
                  : pathname.startsWith("/tickets")
                    ? "tickets"
                    : pathname.startsWith("/ai")
                      ? "ai"
                      : pathname === "/packages"
                        ? "packages"
                        : pathname === "/compare"
                          ? "compare"
                          : pathname === "/admin-users"
                            ? "adminUsers"
                            : pathname === "/admin-content"
                              ? "adminContent"
                              : pathname === "/admin-tickets"
                                ? "adminTickets"
                                : pathname === "/admin-workspace"
                                  ? "adminWorkspace"
                                  : pathname === "/admin-portfolio"
                                    ? "adminPortfolio"
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
      ? [
          { id: "packages" as Page, icon: "package", label: tr.nav.packages },
          { id: "adminUsers" as Page, icon: "users", label: lang === "fa" ? "مدیریت کاربران" : "Users" },
          { id: "adminContent" as Page, icon: "edit", label: lang === "fa" ? "محتوای کاربران" : "Content" },
          { id: "adminTickets" as Page, icon: "tickets", label: lang === "fa" ? "تیکت‌ها" : "Tickets" },
          { id: "adminWorkspace" as Page, icon: "dashboard", label: lang === "fa" ? "فضای کاری" : "Workspace" },
          { id: "adminPortfolio" as Page, icon: "image", label: lang === "fa" ? "نمونه کارها" : "Portfolio" },
        ]
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
                  : page === "contractsHistory"
                    ? lang === "fa" ? "قراردادهای من" : "My Contracts"
                    : page === "tickets"
                      ? tr.tickets.title
                      : page === "packages"
                        ? tr.nav.packages
                        : page === "compare"
                          ? tr.nav.compare
                          : page === "adminUsers"
                            ? lang === "fa" ? "مدیریت کاربران" : "User Management"
                            : page === "adminContent"
                              ? lang === "fa" ? "نظارت بر محتوا" : "Content Moderation"
                              : page === "adminTickets"
                                ? lang === "fa" ? "تیکت‌های پشتیبانی" : "Support Tickets"
                                : page === "adminWorkspace"
                                  ? lang === "fa" ? "فضای کاری" : "Workspace"
                                  : page === "adminPortfolio"
                                    ? lang === "fa" ? "نمونه کارها" : "Portfolio"
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
    navigate("/dashboard")
  }

  const handleLogout = async () => {
    await logout()
    navigate("/")
    setMobileMenuOpen(false)
  }

  if (!user && !isLoading) {
    return (
      <Ctx.Provider value={ctx}>
        <AuthPage
          lang={lang}
          tr={tr}
          dir={dir}
          setLang={setLang}
        />
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
              userName={lang === "fa" ? user?.nameFa || "علی" : user?.nameEn || "Ali"}
              userInitial={lang === "fa" ? (user?.nameFa?.charAt(0) || "ع") : (user?.nameEn?.charAt(0) || "A")}
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
                        subtitle={
                          lang === "fa"
                            ? "بزودی قابل استفاده خواهد بود"
                            : "Coming soon"
                        }
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
