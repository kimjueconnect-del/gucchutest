'use client'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { TransportOrderRow } from '@/lib/api'
import { useAuthStore, useNavStore } from '@/lib/store'
import { inr, dateShort } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import {
  ChevronLeft, Truck, PackageCheck, MapPin, IndianRupee, ClipboardList,
} from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  placed: 'bg-secondary text-secondary-foreground',
  assigned: 'bg-primary/10 text-primary',
  in_transit: 'bg-brand-amber text-brand-amber-foreground',
  delivered: 'bg-primary text-primary-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
}

function AccessDenied() {
  const navigate = useNavStore((s) => s.navigate)
  return (
    <div className="mx-auto max-w-2xl px-3 py-16 text-center">
      <Truck className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-2 text-xl font-bold text-foreground">Log in as a transport partner</h2>
      <p className="mt-1 text-sm text-muted-foreground">You need a transport account to access this dashboard.</p>
      <Button className="mt-3" onClick={() => navigate({ name: 'login' })}>Log in</Button>
    </div>
  )
}

function StatCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card className="gap-0 py-4">
      <CardContent className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="truncate text-lg font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function TransportDashboard() {
  const { account, hydrated } = useAuthStore()
  const back = useNavStore((s) => s.back)
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ['transportOrders'],
    queryFn: () => apiClient.transportOrders(),
    enabled: !!account && account.role === 'transport',
  })

  async function updateStatus(id: string, status: 'in_transit' | 'delivered' | 'cancelled') {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = (data && (data.error || data.message)) || `Update failed (${res.status})`
        toast.error(msg)
        return
      }
      toast.success(`Order marked ${status.replace('_', ' ')}`)
      qc.invalidateQueries({ queryKey: ['transportOrders'] })
    } catch {
      toast.error('Network error. Please try again.')
    }
  }

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-10">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!account || account.role !== 'transport') return <AccessDenied />

  const orders = q.data?.items ?? []
  const assigned = orders.filter((o) => o.status === 'assigned').length
  const inTransit = orders.filter((o) => o.status === 'in_transit').length
  const delivered = orders.filter((o) => o.status === 'delivered').length
  const totalFees = orders.reduce((s, o) => s + (o.transportFee || 0), 0)

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-5">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Transport Dashboard</h1>
        <p className="text-sm text-muted-foreground">Track and fulfil your assigned deliveries.</p>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={ClipboardList} label="Assigned" value={String(assigned)} />
        <StatCard icon={Truck} label="In transit" value={String(inTransit)} />
        <StatCard icon={PackageCheck} label="Delivered" value={String(delivered)} />
        <StatCard icon={IndianRupee} label="Transport fees" value={inr(totalFees)} />
      </div>

      {q.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-36 w-full" />)}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Truck className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No deliveries assigned to you yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => <TransportOrderCard key={o.id} order={o} onUpdate={updateStatus} />)}
        </div>
      )}
    </div>
  )
}

function TransportOrderCard({
  order, onUpdate,
}: {
  order: TransportOrderRow
  onUpdate: (id: string, status: 'in_transit' | 'delivered' | 'cancelled') => void
}) {
  const addr = order.deliveryAddress || {}
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-mono text-xs text-muted-foreground">#{order.id.slice(-8).toUpperCase()}</p>
          <p className="text-sm font-semibold text-foreground">{dateShort(order.createdAt)}</p>
        </div>
        <Badge className={STATUS_COLOR[order.status] || 'bg-secondary'}>{order.status.replace('_', ' ')}</Badge>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {order.items.map((it, i) => (
          <div key={i} className="rounded-lg border border-border px-2.5 py-1.5 text-xs">
            <span className="font-medium text-foreground">{it.name}</span>
            <span className="ml-1.5 text-muted-foreground">× {it.qty}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-lg bg-muted/40 p-3 text-sm">
        <div className="flex items-start gap-1.5 text-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <div>
            {addr.name && <p className="font-medium">{addr.name}</p>}
            <p className="text-muted-foreground">
              {addr.line1}{addr.line1 && (addr.city || addr.state) ? ', ' : ''}{addr.city}{addr.city && addr.state ? ', ' : ''}{addr.state} {addr.pincode}
            </p>
            {addr.phone && <p className="text-muted-foreground">Phone: {addr.phone}</p>}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <span className="text-sm text-muted-foreground">
          Transport fee: <span className="font-semibold text-brand-amber">{inr(order.transportFee)}</span>
        </span>
        <div className="flex items-center gap-2">
          {order.status === 'assigned' && (
            <Button size="sm" onClick={() => onUpdate(order.id, 'in_transit')}>
              <Truck className="h-4 w-4" /> Mark in transit
            </Button>
          )}
          {order.status === 'in_transit' && (
            <>
              <Button size="sm" variant="outline" onClick={() => onUpdate(order.id, 'cancelled')}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => onUpdate(order.id, 'delivered')}>
                <PackageCheck className="h-4 w-4" /> Mark delivered
              </Button>
            </>
          )}
          {(order.status === 'delivered' || order.status === 'cancelled') && (
            <span className="text-xs text-muted-foreground">No further action</span>
          )}
        </div>
      </div>
    </div>
  )
}
