import { forwardRef } from 'react'
import { cn } from '../../lib/utils'

const Input = forwardRef(function Input(
  { label, error, helper, className, ...props },
  ref
) {
  return (
    <div className="w-full">
      {label && <label className="label">{label}</label>}
      <input
        ref={ref}
        className={cn(error ? 'input-error' : 'input', className)}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-red-500 font-medium">{error}</p>}
      {helper && !error && <p className="mt-1.5 text-xs text-neutral-400">{helper}</p>}
    </div>
  )
})

export default Input
