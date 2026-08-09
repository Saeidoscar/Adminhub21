import { Icon } from "./Icon"
import { Link } from "react-router-dom"

interface TopbarProps {
  pageTitle: string
  lang: "fa" | "en"
  onToggleLang: () => void
  onToggleMobileMenu: () => void
  userName: string
  userInitial: string
  theme?: "light" | "dark"
  onToggleTheme?: () => void
  fontSize?: "sm" | "md" | "lg"
  onChangeFontSize?: (size: "sm" | "md" | "lg") => void
  children?: React.ReactNode
}

export function Topbar({
  pageTitle,
  lang,
  onToggleLang,
  onToggleMobileMenu,
  userName,
  userInitial,
  children,
  theme,
  onToggleTheme,
  fontSize,
  onChangeFontSize,
}: TopbarProps) {
  return (
    <div className="hidden lg:flex items-center justify-between px-8 py-4 bg-card border-b border-border flex-shrink-0">
      <div>
        <h1 className="text-sm font-bold text-text">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-3">
        {children}
        {fontSize && onChangeFontSize && (
          <div className="flex items-center gap-1">
            {(["sm", "md", "lg"] as const).map((size) => (
              <button
                key={size}
                onClick={() => onChangeFontSize(size)}
                className={`flex items-center justify-center w-7 h-7 rounded-md text-xs font-bold transition-colors ${
                  fontSize === size
                    ? "bg-border text-navy"
                    : "bg-surface2 border border-border text-navy hover:bg-border"
                }`}
              >
                {size === "sm" ? "S" : size === "md" ? "M" : "L"}
              </button>
            ))}
          </div>
        )}
        {theme && onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface2 border border-border text-xs font-bold text-navy hover:bg-border transition-colors"
          >
            <span>{theme === "light" ? "🌙" : "☀️"}</span>
          </button>
        )}
        <button
          onClick={onToggleLang}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface2 border border-border text-xs font-bold text-navy hover:bg-border transition-colors"
        >
          <span>{lang === "fa" ? "🇬🇧 EN" : "🇮🇷 FA"}</span>
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center text-white text-xs font-bold">
            {userInitial}
          </div>
          <span className="text-sm font-medium text-text">{userName}</span>
        </div>
      </div>
    </div>
  )
}

export function MobileTopbar({
  pageTitle,
  lang,
  onToggleLang,
  onToggleMobileMenu,
  theme,
  onToggleTheme,
  fontSize,
  onChangeFontSize,
}: TopbarProps) {
  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-card border-b border-border flex-shrink-0">
      <button
        onClick={onToggleMobileMenu}
        className="w-9 h-9 rounded-xl bg-surface2 flex items-center justify-center text-navy"
      >
        <Icon name="menu" size={20} />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-navy flex items-center justify-center">
          <Icon name="bot" size={14} className="text-amber" />
        </div>
        <span className="font-bold text-navy text-sm">AdminHub</span>
      </div>
      <div className="flex items-center gap-2">
        {fontSize && onChangeFontSize && (
          <button
            onClick={() =>
              onChangeFontSize(
                fontSize === "sm" ? "md" : fontSize === "md" ? "lg" : "sm",
              )
            }
            className="px-2.5 py-1.5 rounded-lg bg-surface2 border border-border text-xs font-bold text-navy"
          >
            {fontSize === "sm" ? "A⁻" : fontSize === "md" ? "A" : "A⁺"}
          </button>
        )}
        {theme && onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="px-2.5 py-1.5 rounded-lg bg-surface2 border border-border text-xs font-bold text-navy"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        )}
        <button
          onClick={onToggleLang}
          className="px-2.5 py-1.5 rounded-lg bg-surface2 border border-border text-xs font-bold text-navy"
        >
          {lang === "fa" ? "EN" : "FA"}
        </button>
      </div>
    </div>
  )
}
