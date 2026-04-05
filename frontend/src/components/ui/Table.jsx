import { cn } from '../../lib/utils'

export function Table({ children, className }) {
  return (
    <div className={cn('overflow-x-auto rounded-2xl border border-neutral-100', className)}>
      <table className="w-full">{children}</table>
    </div>
  )
}

export function TableHead({ children }) {
  return <thead className="table-header">{children}</thead>
}

export function TableBody({ children }) {
  return <tbody className="divide-y divide-neutral-100">{children}</tbody>
}

export function TableRow({ children, className, onClick }) {
  return (
    <tr
      className={cn('table-row', onClick && 'cursor-pointer', className)}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className }) {
  return <td className={cn('table-cell', className)}>{children}</td>
}

export function TableHeaderCell({ children, className }) {
  return (
    <th className={cn('px-4 py-3 text-left', className)}>
      {children}
    </th>
  )
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-50 mb-4">
          <Icon className="h-8 w-8 text-primary-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-neutral-700">{title}</h3>
      {description && <p className="text-sm text-neutral-400 mt-1.5 max-w-md">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
