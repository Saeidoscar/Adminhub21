import { type ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit'
  icon?: ReactNode
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  type = 'button',
  icon,
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all btn-press disabled:opacity-40 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-navy text-white hover:bg-navy-dark shadow-md',
    secondary: 'bg-surface2 text-text hover:bg-border',
    ghost: 'bg-transparent text-muted hover:text-text hover:bg-surface2',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 shadow-md',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-md',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-5 py-3 text-base',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {icon}
      {children}
    </button>
  )
}
