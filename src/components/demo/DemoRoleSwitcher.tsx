import { useAuth } from "../../contexts/AuthContext"
import type { Lang } from "../../i18n"

/**
 * Small floating control shown only in demo mode. It lets a reviewer jump
 * between the employer and specialist/admin perspectives without credentials.
 */
export function DemoRoleSwitcher({
  role,
  lang,
}: {
  role: "employer" | "admin" | "super_admin"
  lang: Lang
}) {
  const { loginDemo } = useAuth()
  const isFa = lang === "fa"

  return (
    <div
      dir="ltr"
      className="fixed bottom-4 left-4 z-[70] flex items-center gap-1 rounded-full border border-[#1e3a5f]/15 bg-white/95 p-1.5 shadow-lg shadow-[#1e3a5f]/10 backdrop-blur"
    >
      <span className="px-2.5 text-[10px] font-bold uppercase tracking-wider text-[#94a3b8]">
        {isFa ? "پیش‌نمایش" : "Preview"}
      </span>
      {([
        { id: "employer", label: isFa ? "کارفرما" : "Employer" },
        { id: "admin", label: isFa ? "ادمین" : "Admin" },
      ] as const).map((item) => {
        const active = role === item.id
        return (
          <button
            key={item.id}
            onClick={() => loginDemo(item.id)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold transition-colors ${
              active
                ? "bg-[#1e3a5f] text-white shadow-sm"
                : "text-[#64748b] hover:bg-[#f2f5fa]"
            }`}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
