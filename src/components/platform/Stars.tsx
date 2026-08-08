import { Icon } from '../layout/Icon'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'

interface StarsProps {
  rating: number
}

export function Stars({ rating }: StarsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width={12} height={12} viewBox="0 0 24 24" fill={s <= Math.round(rating) ? '#f59e0b' : '#e2e8f0'}>
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      ))}
    </div>
  )
}
