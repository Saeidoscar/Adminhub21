import { type ReactNode } from "react"

interface BadgeProps {
  children: ReactNode
  variant?: "default" | "success" | "warning" | "danger" | "info" | "accent" | "navy" | "platform"
  platform?: string
  size?: "sm" | "md"
  className?: string
}

const variantClasses: Record<string, string> = {
  default: "bg-surface2 text-text",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
  info: "bg-sky-50 text-sky-700",
  accent: "bg-indigo-50 text-indigo-700",
  navy: "bg-navy/10 text-navy",
}

export function Badge({
  children,
  variant = "default",
  platform,
  size = "sm",
  className = "",
}: BadgeProps) {
  const sizeClasses =
    size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm"

  if (platform) {
    const platformGradients: Record<string, string> = {
      instagram: "badge-instagram",
      telegram: "badge-telegram",
      whatsapp: "badge-whatsapp",
      torob: "badge-torob",
      digikala: "badge-digikala",
      linkedin: "badge-linkedin",
    }
    return (
      <span
        className={`${platformGradients[platform]} inline-flex items-center ${sizeClasses} rounded-full text-white font-medium ${className}`}
      >
        {children}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center ${sizeClasses} rounded-full font-medium ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
