import type { ReactNode } from "react"

type SectionHeadingProps = {
  eyebrow?: string
  title: string
  description?: string
  align?: "center" | "start"
  tone?: "default" | "inverse"
  icon?: ReactNode
}

const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = "center",
  tone = "default",
  icon,
}: SectionHeadingProps) => (
  <div
    className={
      align === "center"
        ? "mx-auto max-w-3xl text-center"
        : "max-w-3xl text-start"
    }
  >
    {eyebrow && (
      <div
        className={`mb-3 flex items-center gap-2 text-sm font-semibold ${
          tone === "inverse" ? "text-blue-300" : "text-primary"
        } ${align === "center" ? "justify-center" : "justify-start"}`}
      >
        {icon}
        <span>{eyebrow}</span>
      </div>
    )}
    <h2
      className={`text-2xl font-black leading-relaxed sm:text-3xl lg:text-4xl ${
        tone === "inverse" ? "text-white" : "text-gray-950 dark:text-white"
      }`}
    >
      {title}
    </h2>
    {description && (
      <p
        className={`mt-4 text-sm leading-8 sm:text-base ${
          tone === "inverse"
            ? "text-gray-300"
            : "text-gray-600 dark:text-gray-300"
        }`}
      >
        {description}
      </p>
    )}
  </div>
)

export default SectionHeading
