interface InputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  type?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  disabled?: boolean
  className?: string
  error?: string
}

export function Input({ value, onChange, placeholder, label, type = 'text', dir = 'auto', disabled, className = '', error }: InputProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-text mb-1.5">{label}</label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-xl border bg-card text-text text-sm placeholder:text-muted focus:border-navy focus:ring-2 focus:ring-navy/20 transition-all disabled:opacity-50 ${error ? 'border-rose-500' : 'border-border'}`}
      />
      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  )
}

interface TextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  rows?: number
  className?: string
}

export function Textarea({ value, onChange, placeholder, label, rows = 4, className = '' }: TextareaProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-text mb-1.5">{label}</label>
      )}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text text-sm placeholder:text-muted focus:border-navy focus:ring-2 focus:ring-navy/20 transition-all resize-none"
      />
    </div>
  )
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label?: string
  className?: string
}

export function Select({ value, onChange, options, label, className = '' }: SelectProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-text mb-1.5">{label}</label>
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-text text-sm focus:border-navy focus:ring-2 focus:ring-navy/20 transition-all"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  )
}
