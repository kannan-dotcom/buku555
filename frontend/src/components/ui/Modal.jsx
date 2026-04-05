import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Modal({ open, onClose, title, children, className, size = 'md' }) {
  const overlayRef = useRef(null)

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    function handleEscape(e) {
      if (e.key === 'Escape' && open) onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
  }

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/30 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === overlayRef.current) onClose() }}
    >
      <div
        className={cn(
          'bg-white rounded-2xl shadow-elevated w-full animate-fadeIn',
          sizes[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <h2 className="text-lg font-bold text-neutral-800">{title}</h2>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}
