import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Lang } from '../i18n'
import { lightTokens, darkTokens } from '../design-system/tokens'

type Theme = 'light' | 'dark'

interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  lang: Lang
  setLang: (lang: Lang) => void
  dir: 'ltr' | 'rtl'
  fontSize: 'sm' | 'md' | 'lg'
  setFontSize: (size: 'sm' | 'md' | 'lg') => void
  tokens: typeof lightTokens
}

const ThemeContext = createContext<ThemeContextValue>(null as never)

export const useTheme = () => useContext(ThemeContext)

const getStoredTheme = (): Theme => {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem('theme') as Theme | null
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

const getStoredLang = (): Lang => {
  if (typeof window === 'undefined') return 'fa'
  const stored = localStorage.getItem('lang') as Lang | null
  return stored === 'fa' || stored === 'en' ? stored : 'fa'
}

const getStoredFontSize = (): 'sm' | 'md' | 'lg' => {
  if (typeof window === 'undefined') return 'md'
  const stored = localStorage.getItem('fontSize') as 'sm' | 'md' | 'lg' | null
  return stored === 'sm' || stored === 'md' || stored === 'lg' ? stored : 'md'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getStoredTheme)
  const [lang, setLangState] = useState<Lang>(getStoredLang)
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(getStoredFontSize)

  const dir = lang === 'fa' ? 'rtl' : 'ltr'
  const currentTokens = theme === 'dark' ? darkTokens : lightTokens

  const setLang = (lang: Lang) => {
    localStorage.setItem('lang', lang)
    setLangState(lang)
  }

  const toggleTheme = () => {
    const next: Theme = theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', next)
    setTheme(next)
  }

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('dir', dir)
    document.documentElement.setAttribute('lang', lang)
  }, [theme, dir, lang])

  useEffect(() => {
    const root = document.documentElement.style
    const sizeMap = { sm: '14px', md: '16px', lg: '18px' }
    root.setFontSize(sizeMap[fontSize])
  }, [fontSize])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, lang, setLang, dir, fontSize, setFontSize, tokens: currentTokens }}>
      {children}
    </ThemeContext.Provider>
  )
}
