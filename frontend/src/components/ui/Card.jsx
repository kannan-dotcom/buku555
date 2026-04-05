import { cn } from '../../lib/utils'

export default function Card({ children, className, elevated = false, ...props }) {
  return (
    <div
      className={cn(elevated ? 'card-elevated' : 'card', className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }) {
  return (
    <div className={cn('mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }) {
  return (
    <h3 className={cn('text-lg font-bold text-neutral-800', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }) {
  return (
    <p className={cn('text-sm text-neutral-500 mt-1', className)}>
      {children}
    </p>
  )
}
