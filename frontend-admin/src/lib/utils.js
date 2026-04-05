import { clsx } from 'clsx'

export function cn(...inputs) {
  return clsx(inputs)
}

export function formatCurrency(amount, currency = 'MYR') {
  if (amount == null) return '—'
  return new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date, options = {}) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  }).format(d)
}

export function formatDateTime(date) {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-MY', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

export function truncate(str, length = 50) {
  if (!str) return ''
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function getStatusColor(status) {
  switch (status) {
    case 'complete':
    case 'matched':
    case 'paid':
      return 'success'
    case 'update_needed':
    case 'incomplete':
    case 'overdue':
      return 'error'
    case 'suspense':
    case 'partial':
    case 'draft':
      return 'warning'
    case 'unmatched':
    case 'sent':
      return 'info'
    default:
      return 'neutral'
  }
}

export function getStatusLabel(status) {
  const labels = {
    complete: 'Complete',
    update_needed: 'Update Needed',
    suspense: 'Suspense',
    matched: 'Matched',
    unmatched: 'Unmatched',
    partial: 'Partial',
    incomplete: 'Incomplete',
    draft: 'Draft',
    sent: 'Sent',
    paid: 'Paid',
    overdue: 'Overdue',
    cancelled: 'Cancelled',
  }
  return labels[status] || status
}

export function debounce(fn, delay = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}
