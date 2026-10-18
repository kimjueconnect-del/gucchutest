'use client'
import { useCartStore, useNavStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { inr } from '@/lib/format'
import { Minus, Plus, Trash2, ShoppingCart, ChevronLeft, Truck, ShieldCheck } from 'lucide-react'

export function CartView() {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const { items, setQty, remove } = useCartStore()

  const subtotal = items.reduce((s, i) => s + i.pricePerUnit * i.qty, 0)
  const estTransport = items.length > 0 ? 400 + items.length * 120 : 0

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-3 py-16 text-center">
        <div className="rounded-full bg-secondary p-4">
          <ShoppingCart className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold text-foreground">Your cart is empty</h2>
        <p className="text-sm text-muted-foreground">Browse the wholesale catalogue and add bulk items to your cart.</p>
        <Button onClick={() => navigate({ name: 'home' })}>Start shopping</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Continue shopping
      </button>
      <h1 className="mb-4 text-xl font-bold text-foreground md:text-2xl">Your cart ({items.length} item{items.length !== 1 ? 's' : ''})</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-3 md:col-span-2">
          {items.map((item) => (
            <div key={item.productId} className="flex gap-3 rounded-xl border border-border bg-card p-3">
              <button onClick={() => navigate({ name: 'product', productId: item.productId })} className="shrink-0">
                <img src={item.image || '/logo.svg'} alt={item.name} className="h-20 w-20 rounded-lg border border-border object-cover" />
              </button>
              <div className="flex flex-1 flex-col gap-1">
                <button onClick={() => navigate({ name: 'product', productId: item.productId })} className="text-left text-sm font-medium text-foreground hover:text-primary">
                  {item.name}
                </button>
                <span className="text-xs text-muted-foreground">{inr(item.pricePerUnit)} / {item.unit} · MOQ {item.moq}</span>
                <div className="mt-auto flex items-center justify-between">
                  <div className="flex items-center rounded-lg border border-border">
                    <button onClick={() => setQty(item.productId, item.qty - 1)} className="px-2 py-1.5 text-muted-foreground hover:text-foreground" aria-label="Decrease">
                      <Minus className="h-4 w-4" />
                    </button>
                    <Input
                      type="number"
                      value={item.qty}
                      onChange={(e) => setQty(item.productId, Math.max(item.moq, Math.floor(Number(e.target.value) || item.moq)))}
                      className="h-8 w-16 border-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                      min={item.moq}
                    />
                    <button onClick={() => setQty(item.productId, item.qty + 1)} className="px-2 py-1.5 text-muted-foreground hover:text-foreground" aria-label="Increase">
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-foreground">{inr(item.pricePerUnit * item.qty)}</span>
                    <button onClick={() => remove(item.productId)} className="text-muted-foreground hover:text-destructive" aria-label="Remove item">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <div className="sticky top-32 rounded-xl border border-border bg-card p-4">
            <h2 className="mb-3 text-base font-semibold text-foreground">Order summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Subtotal ({items.length} items)</span><span className="font-medium">{inr(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Est. transport</span><span className="font-medium">{inr(estTransport)}</span></div>
              <p className="text-xs text-muted-foreground">Final transport cost is calculated at checkout based on the auto-assigned carrier.</p>
              <div className="my-2 h-px bg-border" />
              <div className="flex justify-between text-base"><span className="font-semibold">Estimated total</span><span className="font-bold text-foreground">{inr(subtotal + estTransport)}</span></div>
            </div>
            <Button className="mt-4 w-full" onClick={() => navigate({ name: 'checkout' })}>Proceed to checkout</Button>
            <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Verified vendors only</p>
              <p className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-primary" /> Auto-assigned pan-India transport</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
