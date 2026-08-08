import { type ReactNode } from 'react'
import { Icon } from './Icon'

interface NavItem {
  id: string
  icon: string
  label: string
}

interface SidebarProps {
  role: 'employer' | 'admin'
  onLogout: () => void
  page: string
  onNavigate: (page: string) => void
  mobile?: boolean
  onClose?: () => void
  children?: ReactNode
  navItems?: NavItem[]
}

export function Sidebar({ role, onLogout, page, onNavigate, mobile, onClose, children, navItems }: SidebarProps) {
  const defaultNavItems = [
    { id: 'dashboard', icon: 'dashboard', label: 'Dashboard' },
    { id: 'marketplace', icon: 'marketplace', label: 'Marketplace' },
    { id: 'tools-rental', icon: 'camera', label: 'Tools Rental' },
    { id: 'editors', icon: 'edit', label: 'Editors' },
    { id: 'vibe-coders', icon: 'bot', label: 'Vibe Coders' },
    { id: 'skills', icon: 'chart', label: 'Skills' },
    { id: 'contracts', icon: 'contracts', label: 'Contracts' },
    { id: 'ai', icon: 'ai', label: 'AI' },
    { id: 'profile', icon: 'profile', label: 'Profile' },
  ]

  const items = navItems || defaultNavItems

  return (
    <div className={`flex flex-col bg-navy h-full ${mobile ? 'w-full' : 'w-64'}`}>
      <div className="flex items-center justify-between px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber flex items-center justify-center flex-shrink-0">
            <Icon name="bot" size={17} className="text-navy" />
          </div>
          <span className="text-white font-bold text-lg">AdminHub</span>
        </div>
        {mobile && onClose && (
          <button onClick={onClose} className="text-white/60 hover:text-white">
            <Icon name="x" size={20} />
          </button>
        )}
      </div>

      <div className="px-6 py-3 border-b border-white/10">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
            role === 'employer' ? 'bg-amber/20 text-amber' : 'bg-emerald/20 text-emerald'
          }`}
        >
          <Icon name={role === 'employer' ? 'marketplace' : 'profile'} size={11} />
          {role === 'employer' ? 'Employer' : 'Admin'}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => { onNavigate(item.id); onClose?.() }}
            className={`nav-item w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all btn-press ${
              page === item.id
                ? 'bg-white/15 text-white border border-white/20'
                : 'text-blue-200 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className={`flex-shrink-0 ${page === item.id ? 'text-amber' : 'text-blue-300'}`}>
              <Icon name={item.icon} size={18} />
            </div>
            <span className="text-start">{item.label}</span>
            {page === item.id && (
              <div className="ms-auto w-1.5 h-1.5 rounded-full bg-amber flex-shrink-0" />
            )}
          </button>
        ))}
        {children}
      </nav>

      <div className="px-3 pb-6">
        <button
          onClick={onLogout}
          className="nav-item w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-blue-300 hover:bg-white/10 hover:text-white transition-all"
        >
          <Icon name="logout" size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  )
}
