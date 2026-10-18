'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useNavStore, useAuthStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { inr, dateShort } from '@/lib/format'
import { ChevronLeft, Package, Truck, MapPin, Check } from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  placed: 'bg-secondary text-secondary-foreground',
  assigned: 'bg-primary/10 text-primary',
  in_transit: 'bg-brand-amber text-brand-amber-foreground',
  delivered: 'bg-primary text-primary-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
}

// Order status stepper — visualises the 4-step fulfillment journey.
const STEPS = [
  { key: 'placed', label: 'Placed' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_transit', label: 'In transit' },
  { key: 'delivered', label: 'Delivered' },
]
function stepIndex(status: string): number {
  const i = STEPS.findIndex((s) => s.key === status)
  return i < 0 ? -1 : i
}

function OrderTimeline({ status }: { status: string }) {
  if (status === 'cancelled') {
    return <div className="mt-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive">Order cancelled</div>
  }
  const current = stepIndex(status)
  return (
    <div className="mt-3 flex items-center">
      {STEPS.map((s, i) => {
        const done = i <= current
        const active = i === current
        return (
          <div key={s.key} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors ${done ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'} ${active ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`}>
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              <span className={`mt-1 text-[10px] ${done ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-1 h-0.5 flex-1 ${i < current ? 'bg-primary' : 'bg-border'}`} />}
          </div>
        )
      })}
    </div>
  )
}

export function OrdersView() {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const account = useAuthStore((s) => s.account)
  const q = useQuery({ queryKey: ['myOrders'], queryFn: () => apiClient.myOrders(), enabled: !!account })

  if (!account) {
    return (
      <div className="mx-auto max-w-2xl px-3 py-16 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-2 text-xl font-bold">Log in to view orders</h2>
        <Button className="mt-3" onClick={() => navigate({ name: 'login' })}>Log in</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <h1 className="mb-4 text-xl font-bold text-foreground md:text-2xl">My orders</h1>

      {q.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
      ) : q.data && q.data.items.length > 0 ? (
        <div className="space-y-3">
          {q.data.items.map((o) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm font-semibold text-foreground">{dateShort(o.createdAt)}</p>
                </div>
                <Badge className={STATUS_COLOR[o.status] || 'bg-secondary'}>{o.status.replace('_', ' ')}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.items.slice(0, 4).map((it, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg border border-border p-1.5 pr-3">
                    {it.image && <img src={it.image} alt={it.name} className="h-10 w-10 rounded object-cover" />}
                    <div>
                      <p className="text-xs font-medium text-foreground line-clamp-1">{it.name}</p>
                      <p className="text-[11px] text-muted-foreground">{it.qty} {it.unit}</p>
                    </div>
                  </div>
                ))}
                {o.items.length > 4 && <span className="self-center text-xs text-muted-foreground">+{o.items.length - 4} more</span>}
              </div>
              <OrderTimeline status={o.status} />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="h-3.5 w-3.5 text-primary" />
                  {o.status === 'delivered' ? 'Delivered' : o.status === 'in_transit' ? 'In transit' : o.status === 'assigned' ? 'Transport assigned' : 'Awaiting assignment'}
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {o.deliveryAddress.city}, {o.deliveryAddress.state} {o.deliveryAddress.pincode}
                </div>
                <span className="font-bold text-foreground">{inr(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No orders yet.</p>
          <Button variant="link" onClick={() => navigate({ name: 'home' })}>Start shopping</Button>
        </div>
      )}
    </div>
  )
}
