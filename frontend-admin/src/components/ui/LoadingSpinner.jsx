import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

export default function LoadingSpinner({ size = 'md', className, label }) {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  }

  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary-500', sizes[size])} />
      {label && <p className="text-sm text-neutral-500 font-medium">{label}</p>}
    </div>
  )
}

export function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <LoadingSpinner size="lg" label={label} />
    </div>
  )
}
