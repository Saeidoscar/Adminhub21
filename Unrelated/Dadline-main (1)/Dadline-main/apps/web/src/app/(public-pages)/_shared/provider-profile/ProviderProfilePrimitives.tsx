import { TbStarFilled } from "react-icons/tb"

export const ProfileSectionHeading = ({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description?: string
}) => (
  <header className="mb-4 max-w-2xl">
    <p className="text-xs font-bold tracking-[0.22em] text-primary">
      {eyebrow}
    </p>
    <h2 className="mt-3 text-2xl font-black leading-tight text-gray-950 dark:text-white">
      {title}
    </h2>
    {description && (
      <p className="mt-4 text-sm leading-8 text-gray-600 dark:text-gray-300">
        {description}
      </p>
    )}
  </header>
)

export const ProfileEmptyState = ({ text }: { text: string }) => (
  <div className="border-y border-dashed border-gray-200 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
    {text}
  </div>
)

export const ProviderStarRating = ({
  rating,
  showValue = false,
  size = 16,
}: {
  rating: number
  showValue?: boolean
  size?: number
}) => (
  <div className="flex items-center gap-2" aria-label={`امتیاز ${rating} از ۵`}>
    <div className="flex gap-0.5 text-amber-400" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((star) => (
        <TbStarFilled
          key={star}
          size={size}
          className={
            star <= Math.round(rating) ? "" : "text-gray-200 dark:text-gray-700"
          }
        />
      ))}
    </div>
    {showValue && (
      <span className="font-extrabold text-gray-900 dark:text-white">
        {rating.toLocaleString("fa-IR", { maximumFractionDigits: 1 })}
      </span>
    )}
  </div>
)
