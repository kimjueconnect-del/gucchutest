'use client'
import { useState } from 'react'
import { useCartStore, useNavStore, useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { inr } from '@/lib/format'
import { toast } from 'sonner'
import { CheckCircle2, ChevronLeft, Truck, ShieldCheck, PackageCheck } from 'lucide-react'

export function CheckoutView() {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const { items, clear } = useCartStore()
  const account = useAuthStore((s) => s.account)
  const [placing, setPlacing] = useState(false)
  const [placed, setPlaced] = useState<null | { id: string; total: number }>(null)
  const [addr, setAddr] = useState({
    name: account?.name || '',
    phone: account?.phone || '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
  })

  const subtotal = items.reduce((s, i) => s + i.pricePerUnit * i.qty, 0)
  const estTransport = items.length > 0 ? 400 + items.length * 120 : 0
  const total = subtotal + estTransport

  function update(k: keyof typeof addr, v: string) { setAddr((a) => ({ ...a, [k]: v })) }

  async function placeOrder() {
    if (!account) { toast.error('Please log in to place an order.'); navigate({ name: 'login' }); return }
    for (const k of Object.keys(addr) as (keyof typeof addr)[]) {
      if (!addr[k].trim()) { toast.error('Please complete all delivery fields.'); return }
    }
    setPlacing(true)
    try {
      const res = await apiClient.placeOrder({
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
        deliveryAddress: addr,
      })
      setPlaced({ id: res.order.id, total: res.order.total })
      clear()
      toast.success('Order placed successfully')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to place order')
    } finally {
      setPlacing(false)
    }
  }

  if (placed) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-3 py-16 text-center">
        <div className="rounded-full bg-primary/10 p-4">
          <CheckCircle2 className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Order confirmed</h2>
        <p className="text-sm text-muted-foreground">
          Your order <span className="font-mono font-medium text-foreground">{placed.id.slice(-8).toUpperCase()}</span> has been placed.
          A verified transport partner has been auto-assigned and the vendor has been notified.
        </p>
        <div className="my-2 w-full max-w-sm rounded-xl border border-border bg-card p-4 text-left text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Order total</span><span className="font-bold">{inr(placed.total)}</span></div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-primary"><Truck className="h-3.5 w-3.5" /> Transport assignment in progress</div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ name: 'home' })}>Continue shopping</Button>
          <Button onClick={() => navigate({ name: 'orders' })}>View my orders</Button>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-16 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <Button variant="link" onClick={() => navigate({ name: 'home' })}>Browse products</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back to cart
      </button>
      <h1 className="mb-4 text-xl font-bold text-foreground md:text-2xl">Checkout</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-base font-semibold text-foreground">Delivery address</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={addr.name} onChange={(e) => update('name', e.target.value)} placeholder="Receiver name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={addr.phone} onChange={(e) => update('phone', e.target.value)} placeholder="10-digit mobile" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="line1">Address line</Label>
                <Input id="line1" value={addr.line1} onChange={(e) => update('line1', e.target.value)} placeholder="House no, street, area" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={addr.city} onChange={(e) => update('city', e.target.value)} placeholder="City" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="state">State</Label>
                <Input id="state" value={addr.state} onChange={(e) => update('state', e.target.value)} placeholder="State" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pincode">Pincode</Label>
                <Input id="pincode" value={addr.pincode} onChange={(e) => update('pincode', e.target.value)} placeholder="6-digit pincode" inputMode="numeric" />
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-base font-semibold text-foreground">Items</h2>
            <div className="space-y-2">
              {items.map((i) => (
                <div key={i.productId} className="flex items-center gap-3">
                  <img src={i.image || '/logo.svg'} alt={i.name} className="h-12 w-12 rounded-md border border-border object-cover" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{i.name}</p>
                    <p className="text-xs text-muted-foreground">{i.qty} {i.unit} × {inr(i.pricePerUnit)}</p>
                  </div>
                  <span className="text-sm font-semibold">{inr(i.qty * i.pricePerUnit)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="md:col-span-1">
          <div className="sticky top-32 rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-base font-semibold text-foreground">Payment summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{inr(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Transport (estimated)</span><span>{inr(estTransport)}</span></div>
              <div className="my-2 h-px bg-border" />
              <div className="flex justify-between text-base"><span className="font-semibold">Total</span><span className="font-bold text-foreground">{inr(total)}</span></div>
            </div>
            <Button className="mt-4 w-full" onClick={placeOrder} disabled={placing}>
              {placing ? 'Placing order…' : 'Place order'}
            </Button>
            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure transaction</p>
              <p className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-primary" /> Transport auto-assigned after order</p>
              <p className="flex items-center gap-1.5"><PackageCheck className="h-3.5 w-3.5 text-primary" /> Vendor notified on confirmation</p>
            </div>
            {!account && <p className="mt-2 text-xs font-medium text-brand-amber">Login required to place an order.</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
