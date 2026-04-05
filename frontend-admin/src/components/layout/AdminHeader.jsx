import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Menu, Bell, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { cn } from '../../lib/utils'

export default function AdminHeader({ onMenuClick }) {
  const { user, profile, signOut } = useAuth()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 lg:px-6 bg-white/80 backdrop-blur-md border-b border-neutral-100">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="hidden lg:block text-sm font-medium text-neutral-400">Admin Panel</span>
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 p-2 rounded-xl text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 text-white text-sm font-semibold">
              {(profile?.full_name || user?.email || 'A').charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block text-sm font-medium max-w-[150px] truncate text-neutral-700">
              {profile?.full_name || user?.email}
            </span>
            <ChevronDown className={cn('h-4 w-4 text-neutral-400 transition-transform', dropdownOpen && 'rotate-180')} />
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white border border-neutral-100 shadow-elevated py-1 animate-fadeIn">
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-800 truncate">
                  {profile?.full_name || 'Admin'}
                </p>
                <p className="text-xs text-neutral-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider text-primary-600 bg-primary-50 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              </div>
              <div className="pt-1">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
