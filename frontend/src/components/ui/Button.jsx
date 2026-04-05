import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

const variants = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  tertiary: 'btn-tertiary',
  ghost: 'btn-ghost',
  outline: 'btn-outline',
  danger: 'btn-danger',
}

const sizes = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-6 py-3 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className,
  ...props
}) {
  return (
    <button
      className={cn(variants[variant], sizes[size], 'inline-flex items-center justify-center gap-2', className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : Icon ? (
        <Icon className="h-4 w-4" />
      ) : null}
      {children}
    </button>
  )
}
