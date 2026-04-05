import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Receipt,
  Landmark,
  BookOpen,
  Settings,
} from 'lucide-react'
import { cn } from '../../lib/utils'

const mobileNavItems = [
  { name: 'Home', to: '/dashboard', icon: LayoutDashboard },
  { name: 'Receipts', to: '/receipts', icon: Receipt },
  { name: 'Bank', to: '/bank-statements', icon: Landmark },
  { name: 'Ledger', to: '/ledger', icon: BookOpen },
  { name: 'Settings', to: '/settings', icon: Settings },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-neutral-100 shadow-soft lg:hidden">
      <div className="flex items-center justify-around h-16">
        {mobileNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 px-3 py-2 text-xs font-medium transition-colors',
                isActive
                  ? 'text-primary-500'
                  : 'text-neutral-400 hover:text-neutral-600'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
