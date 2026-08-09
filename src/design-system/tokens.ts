export type Theme = "light" | "dark"

export const lightTokens = {
  colors: {
    bg: "#f8fafc",
    surface: "#ffffff",
    surface2: "#f2f5fa",
    border: "#e2e8f0",
    borderStrong: "#cbd5e1",
    text: "#0f172a",
    textMuted: "#64748b",
    textSubtle: "#94a3b8",
  },
  brand: {
    primary: "#1e3a5f",
    primaryHover: "#122435",
    primaryLight: "#2d5a8e",
    primaryBg: "rgba(30,58,95,0.06)",
  },
  semantic: {
    success: "#10b981",
    successBg: "#ecfdf5",
    warning: "#f59e0b",
    warningBg: "#fffbeb",
    danger: "#ef4444",
    dangerBg: "#fef2f2",
    info: "#3b82f6",
    infoBg: "#eff6ff",
    accent: "#6366f1",
    accentBg: "#eef2ff",
  },
  platform: {
    instagram:
      "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
    telegram: "#229ED9",
    whatsapp: "#25D366",
    torob: "#e53935",
    digikala: "#ee1b24",
    linkedin: "#0077b5",
  },
} as const

export const darkTokens = {
  colors: {
    bg: "#0b1020",
    surface: "#11182b",
    surface2: "#16203a",
    border: "rgba(255,255,255,.08)",
    borderStrong: "rgba(255,255,255,.14)",
    text: "#eef2ff",
    textMuted: "#9aa6c4",
    textSubtle: "#64748b",
  },
  brand: {
    primary: "#6d7cff",
    primaryHover: "#5767ff",
    primaryLight: "#8b5cf6",
    primaryBg: "rgba(109,124,255,0.12)",
  },
  semantic: {
    success: "#22c55e",
    successBg: "rgba(34,197,94,0.12)",
    warning: "#f59e0b",
    warningBg: "rgba(245,158,11,0.12)",
    danger: "#ef4444",
    dangerBg: "rgba(239,68,68,0.12)",
    info: "#38bdf8",
    infoBg: "rgba(56,189,248,0.12)",
    accent: "#14b8a8",
    accentBg: "rgba(20,184,166,0.12)",
  },
  platform: {
    instagram:
      "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)",
    telegram: "#229ED9",
    whatsapp: "#25D366",
    torob: "#e53935",
    digikala: "#ee1b24",
    linkedin: "#0077b5",
  },
} as const

export const tokens = {
  spacing: {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
    xl2: "2rem",
    xl3: "2.5rem",
    xl4: "3rem",
  },
  typography: {
    fontEn: "'Plus Jakarta Sans', system-ui, sans-serif",
    fontFa: "'Vazirmatn', system-ui, sans-serif",
    fontMono: "'JetBrains Mono', monospace",
    sizes: {
      xs: "0.75rem",
      sm: "0.875rem",
      base: "1rem",
      lg: "1.125rem",
      xl: "1.25rem",
      xl2: "1.5rem",
      xl3: "1.875rem",
      xl4: "2.25rem",
    },
  },
  borderRadius: {
    sm: "0.375rem",
    md: "0.5rem",
    lg: "0.75rem",
    xl: "1rem",
    xl2: "1.25rem",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgba(0,0,0,.05)",
    md: "0 4px 6px -1px rgba(0,0,0,.1), 0 2px 4px -1px rgba(0,0,0,.06)",
    lg: "0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05)",
    xl: "0 20px 25px -5px rgba(0,0,0,.1), 0 10px 10px -5px rgba(0,0,0,.04)",
  },
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1200,
    modal: 1300,
    toast: 1400,
    tooltip: 1500,
  },
  navItems: [
    { id: "dashboard", icon: "dashboard", labelKey: "nav.dashboard" },
    { id: "marketplace", icon: "marketplace", labelKey: "nav.marketplace" },
    { id: "tools-rental", icon: "camera", labelKey: "nav.toolsRental" },
    { id: "editors", icon: "edit", labelKey: "nav.editors" },
    { id: "vibe-coders", icon: "bot", labelKey: "nav.vibeCoders" },
    { id: "skills", icon: "chart", labelKey: "nav.skills" },
    { id: "contracts", icon: "contracts", labelKey: "nav.contracts" },
    { id: "ai", icon: "ai", labelKey: "nav.ai" },
    { id: "profile", icon: "profile", labelKey: "nav.profile" },
  ] as const,
} as const

export type ThemeTokens = typeof lightTokens
export type NavItem = typeof tokens.navItems[number]
