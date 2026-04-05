import { cn } from '../../lib/utils'

const variants = {
  success: 'badge-success',
  error: 'badge-error',
  warning: 'badge-warning',
  info: 'badge-info',
  neutral: 'badge-neutral',
  accent: 'badge-accent',
}

export default function Badge({ children, variant = 'neutral', className }) {
  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  )
}
