'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { SalesOrderRow, ProductPublic } from '@/lib/api'
import { useAuthStore, useNavStore } from '@/lib/store'
import { inr, dateShort } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  ChevronLeft, UserPlus, IndianRupee, ShoppingCart, PackageCheck, MapPin, Search,
} from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  placed: 'bg-secondary text-secondary-foreground',
  assigned: 'bg-primary/10 text-primary',
  in_transit: 'bg-brand-amber text-brand-amber-foreground',
  delivered: 'bg-primary text-primary-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
}

interface AddrForm {
  name: string
  phone: string
  line1: string
  city: string
  state: string
  pincode: string
}
const EMPTY_ADDR: AddrForm = { name: '', phone: '', line1: '', city: '', state: '', pincode: '' }

function AccessDenied() {
  const navigate = useNavStore((s) => s.navigate)
  return (
    <div className="mx-auto max-w-2xl px-3 py-16 text-center">
      <UserPlus className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-2 text-xl font-bold text-foreground">Log in as a sales rep</h2>
      <p className="mt-1 text-sm text-muted-foreground">You need a sales account to access this dashboard.</p>
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

export function SalesDashboard() {
  const { account, hydrated } = useAuthStore()
  const back = useNavStore((s) => s.back)
  const qc = useQueryClient()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [addr, setAddr] = useState<AddrForm>(EMPTY_ADDR)
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({})
  const [filter, setFilter] = useState('')

  const ordersQ = useQuery({
    queryKey: ['salesOrders'],
    queryFn: () => apiClient.salesOrders(),
    enabled: !!account && account.role === 'sales',
  })
  const productsQ = useQuery({
    queryKey: ['salesProducts'],
    queryFn: () => apiClient.products({ limit: 20 }),
    enabled: !!account && account.role === 'sales',
  })

  const createM = useMutation({
    mutationFn: (body: { items: { productId: string; qty: number }[]; deliveryAddress: Record<string, string> }) =>
      apiClient.salesCreateOrder(body),
    onSuccess: (data) => {
      toast.success(`Order placed. Commission earned: ${inr(data.order.commission)}`)
      qc.invalidateQueries({ queryKey: ['salesOrders'] })
      setDialogOpen(false)
      setAddr(EMPTY_ADDR)
      setQtyMap({})
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Failed to place order'),
  })

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-10">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!account || account.role !== 'sales') return <AccessDenied />

  const orders = ordersQ.data?.items ?? []
  const products = productsQ.data?.items ?? []
  const totalCommission = orders.reduce((s, o) => s + (o.salesCommission || 0), 0)
  const inProgress = orders.filter((o) => o.status === 'placed' || o.status === 'assigned' || o.status === 'in_transit').length
  const delivered = orders.filter((o) => o.status === 'delivered').length

  function openDialog() {
    setAddr(EMPTY_ADDR)
    setQtyMap({})
    setFilter('')
    setDialogOpen(true)
  }

  function onSubmit() {
    const items = Object.entries(qtyMap)
      .map(([productId, qty]) => ({ productId, qty: Math.max(0, Math.floor(qty) || 0) }))
      .filter((i) => i.qty > 0)
    if (items.length === 0) { toast.error('Add at least one product with a quantity.'); return }
    if (!addr.name || !addr.phone || !addr.line1 || !addr.city || !addr.state || !addr.pincode) {
      toast.error('Please complete all delivery address fields.')
      return
    }
    createM.mutate({ items, deliveryAddress: { ...addr } })
  }

  const filteredProducts = filter
    ? products.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()) || p.categoryName.toLowerCase().includes(filter.toLowerCase()))
    : products

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">Sales Dashboard</h1>
          <p className="text-sm text-muted-foreground">Refer leads, create orders, earn commission.</p>
        </div>
        <Button onClick={openDialog}>
          <UserPlus className="h-4 w-4" /> Create order for a lead
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={ShoppingCart} label="Orders referred" value={String(orders.length)} />
        <StatCard icon={IndianRupee} label="Commission earned" value={inr(totalCommission)} />
        <StatCard icon={UserPlus} label="In-progress" value={String(inProgress)} />
        <StatCard icon={PackageCheck} label="Delivered" value={String(delivered)} />
      </div>

      {ordersQ.isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No orders referred yet. Create your first order for a lead.</p>
          <Button className="mt-3" onClick={openDialog}><UserPlus className="h-4 w-4" /> Create order</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => <SalesOrderCard key={o.id} order={o} />)}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create order for a lead</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="rounded-lg border border-border p-3">
              <p className="mb-2 text-sm font-medium text-foreground">Delivery address</p>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="sa-name">Customer name</Label>
                    <Input id="sa-name" value={addr.name} onChange={(e) => setAddr({ ...addr, name: e.target.value })} placeholder="Ramesh Kumar" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="sa-phone">Phone</Label>
                    <Input id="sa-phone" value={addr.phone} onChange={(e) => setAddr({ ...addr, phone: e.target.value })} placeholder="9876543210" />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="sa-line1">Address line</Label>
                  <Input id="sa-line1" value={addr.line1} onChange={(e) => setAddr({ ...addr, line1: e.target.value })} placeholder="12 Connaught Place" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="sa-city">City</Label>
                    <Input id="sa-city" value={addr.city} onChange={(e) => setAddr({ ...addr, city: e.target.value })} placeholder="New Delhi" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="sa-state">State</Label>
                    <Input id="sa-state" value={addr.state} onChange={(e) => setAddr({ ...addr, state: e.target.value })} placeholder="Delhi" />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="sa-pin">Pincode</Label>
                    <Input id="sa-pin" value={addr.pincode} onChange={(e) => setAddr({ ...addr, pincode: e.target.value })} placeholder="110001" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">Products</p>
                <p className="text-xs text-muted-foreground">Add quantities for items the lead wants.</p>
              </div>
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Filter products…"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                />
              </div>
              <div className="max-h-64 space-y-2 overflow-y-auto scroll-thin rounded-lg border border-border p-2">
                {productsQ.isLoading ? (
                  <div className="space-y-2 p-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
                ) : filteredProducts.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">No products found.</p>
                ) : (
                  filteredProducts.map((p) => (
                    <ProductPickerRow
                      key={p.id}
                      product={p}
                      qty={qtyMap[p.id] ?? 0}
                      onQty={(v) => setQtyMap((m) => {
                        const next = { ...m }
                        if (v <= 0) delete next[p.id]
                        else next[p.id] = v
                        return next
                      })}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={onSubmit} disabled={createM.isPending}>
              {createM.isPending ? 'Placing order…' : 'Place order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function ProductPickerRow({
  product, qty, onQty,
}: {
  product: ProductPublic
  qty: number
  onQty: (v: number) => void
}) {
  const img = product.images?.[0]
  return (
    <div className="flex items-center gap-2 rounded-md border border-border p-2">
      {img ? (
        <img src={img} alt={product.name} className="h-9 w-9 rounded object-cover" />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded bg-muted text-muted-foreground">
          <ShoppingCart className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{product.name}</p>
        <p className="text-xs text-muted-foreground">
          {inr(product.pricePerUnit)}/{product.unit} · MOQ {product.moq} · Stock {product.stock}
        </p>
      </div>
      <Input
        type="number"
        min={0}
        value={qty === 0 ? '' : String(qty)}
        onChange={(e) => onQty(Math.max(0, Math.floor(Number(e.target.value) || 0)))}
        className="h-8 w-20"
        placeholder="0"
      />
    </div>
  )
}

function SalesOrderCard({ order }: { order: SalesOrderRow }) {
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

      <div className="mt-3 grid gap-2 rounded-lg bg-muted/40 p-3 text-sm sm:grid-cols-2">
        <div className="flex items-start gap-1.5 text-foreground">
          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
          <div>
            {addr.name && <p className="font-medium">{addr.name}</p>}
            <p className="text-muted-foreground">
              {addr.line1}{addr.line1 && addr.city ? ', ' : ''}{addr.city}{addr.city && addr.state ? ', ' : ''}{addr.state} {addr.pincode}
            </p>
            {addr.phone && <p className="text-muted-foreground">Phone: {addr.phone}</p>}
          </div>
        </div>
        <div className="flex flex-col items-start gap-0.5 sm:items-end">
          <span className="text-xs text-muted-foreground">Commission: <span className="font-semibold text-brand-amber">{inr(order.salesCommission)}</span></span>
          <span className="text-sm font-bold text-foreground">Total: {inr(order.total)}</span>
        </div>
      </div>
    </div>
  )
}
