// Currency / number formatting helpers for the storefront.
export function inr(n: number): string {
  if (!Number.isFinite(n)) return '₹0'
  return '₹' + Math.round(n).toLocaleString('en-IN')
}

export function inrDecimal(n: number): string {
  if (!Number.isFinite(n)) return '₹0.00'
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function dateShort(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function timeAgo(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const days = Math.floor(h / 24)
  if (days < 30) return `${days}d ago`
  return dateShort(date)
}
