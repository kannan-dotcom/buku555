import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  FileCheck,
  CreditCard,
  ExternalLink,
  X,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { APP_NAME, APP_TAGLINE, MAIN_APP_URL } from '../../lib/constants'

const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Lead Management', to: '/leads', icon: Users },
  { name: 'Accountant Approvals', to: '/accountants', icon: FileCheck },
  { name: 'Subscriptions', to: '/subscriptions', icon: CreditCard },
]

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/20 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-neutral-100 transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <img src="/assets/logo_icon_square.png" alt="Buku 555" className="w-9 h-9 rounded-xl" />
            <div>
              <span className="text-lg font-bold text-neutral-800">{APP_NAME}</span>
              <span className="block text-xs font-medium text-primary-500 -mt-0.5">{APP_TAGLINE}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary-50 text-primary-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50'
                )
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Bottom navigation */}
        <div className="border-t border-neutral-100 px-3 py-4 space-y-1">
          <a
            href={MAIN_APP_URL}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 transition-all"
          >
            <ExternalLink className="h-5 w-5 flex-shrink-0" />
            Main App
          </a>
        </div>
      </aside>
    </>
  )
}
