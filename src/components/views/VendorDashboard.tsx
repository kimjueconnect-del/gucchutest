'use client'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { VendorProductRow, VendorOrderRow } from '@/lib/api'
import { useAuthStore, useNavStore } from '@/lib/store'
import { inr, dateShort } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table'
import { toast } from 'sonner'
import {
  ChevronLeft, Plus, Pencil, Trash2, Package, Boxes, ShoppingCart, IndianRupee,
} from 'lucide-react'

const STATUS_COLOR: Record<string, string> = {
  placed: 'bg-secondary text-secondary-foreground',
  assigned: 'bg-primary/10 text-primary',
  in_transit: 'bg-brand-amber text-brand-amber-foreground',
  delivered: 'bg-primary text-primary-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
}

const PRODUCT_STATUS_COLOR: Record<string, string> = {
  active: 'bg-primary/10 text-primary',
  paused: 'bg-secondary text-secondary-foreground',
  draft: 'bg-secondary text-secondary-foreground',
}

// ---- helpers to (de)serialise the JSON-string fields on VendorProductRow ----
function parseImages(raw: string): string[] {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : [] } catch { return [] }
}
function parseSpecs(raw: string): { label: string; value: string }[] {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : [] } catch { return [] }
}
function parseTiers(raw: string): { minQty: number; pricePerUnit: number }[] {
  try { const v = JSON.parse(raw); return Array.isArray(v) ? v : [] } catch { return [] }
}

interface FormState {
  name: string
  description: string
  categoryName: string
  unit: string
  moq: string
  pricePerUnit: string
  stock: string
  featured: boolean
  images: string
  specs: string
  bulkTiers: string
}

const EMPTY_FORM: FormState = {
  name: '', description: '', categoryName: 'General', unit: 'piece',
  moq: '1', pricePerUnit: '', stock: '0', featured: false,
  images: '', specs: '', bulkTiers: '',
}

function productToForm(p: VendorProductRow): FormState {
  return {
    name: p.name,
    description: p.description,
    categoryName: p.categoryName || 'General',
    unit: p.unit || 'piece',
    moq: String(p.moq ?? 1),
    pricePerUnit: String(p.pricePerUnit ?? ''),
    stock: String(p.stock ?? 0),
    featured: !!p.featured,
    images: parseImages(p.images).join(', '),
    specs: parseSpecs(p.specs).map((s) => `${s.label}:${s.value}`).join('\n'),
    bulkTiers: parseTiers(p.bulkTiers).map((t) => `${t.minQty}:${t.pricePerUnit}`).join('\n'),
  }
}

function formToBody(f: FormState): Record<string, unknown> {
  const images = f.images.split(',').map((s) => s.trim()).filter(Boolean).slice(0, 8)
  const specs = f.specs
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(':')
      if (idx < 0) return { label: line.slice(0, 40), value: '' }
      return { label: line.slice(0, idx).trim().slice(0, 40), value: line.slice(idx + 1).trim().slice(0, 80) }
    })
    .slice(0, 12)
  const bulkTiers = f.bulkTiers
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [a, b] = line.split(':')
      const minQty = Math.max(1, Math.floor(Number((a || '').trim()) || 1))
      const pricePerUnit = Math.max(0, Number((b || '').trim()) || 0)
      return { minQty, pricePerUnit }
    })
    .filter((t) => Number.isFinite(t.pricePerUnit))
    .slice(0, 5)
  return {
    name: f.name.trim(),
    description: f.description.trim(),
    categoryName: f.categoryName.trim() || 'General',
    unit: f.unit.trim() || 'piece',
    moq: Number(f.moq) || 1,
    pricePerUnit: Number(f.pricePerUnit) || 0,
    stock: Number(f.stock) || 0,
    featured: f.featured,
    images,
    specs,
    bulkTiers,
  }
}

function AccessDenied() {
  const navigate = useNavStore((s) => s.navigate)
  return (
    <div className="mx-auto max-w-2xl px-3 py-16 text-center">
      <Package className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-2 text-xl font-bold text-foreground">Log in as a vendor</h2>
      <p className="mt-1 text-sm text-muted-foreground">You need a vendor account to access this dashboard.</p>
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

export function VendorDashboard() {
  const { account, hydrated } = useAuthStore()
  const back = useNavStore((s) => s.back)
  const qc = useQueryClient()

  const [tab, setTab] = useState<'products' | 'orders'>('products')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<VendorProductRow | null>(null)
  const [form, setForm] = useState<FormState>(EMPTY_FORM)

  const productsQ = useQuery({
    queryKey: ['vendorProducts'],
    queryFn: () => apiClient.vendorProducts(),
    enabled: !!account && account.role === 'vendor',
  })
  const ordersQ = useQuery({
    queryKey: ['vendorOrders'],
    queryFn: () => apiClient.vendorOrders(),
    enabled: !!account && account.role === 'vendor',
  })

  const createM = useMutation({
    mutationFn: (body: Record<string, unknown>) => apiClient.vendorCreateProduct(body),
    onSuccess: () => { toast.success('Product created'); qc.invalidateQueries({ queryKey: ['vendorProducts'] }); setFormOpen(false) },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Failed to create product'),
  })
  const updateM = useMutation({
    mutationFn: ({ id, body }: { id: string; body: Record<string, unknown> }) => apiClient.vendorUpdateProduct(id, body),
    onSuccess: () => { toast.success('Product updated'); qc.invalidateQueries({ queryKey: ['vendorProducts'] }); setFormOpen(false) },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Failed to update product'),
  })
  const deleteM = useMutation({
    mutationFn: (id: string) => apiClient.vendorDeleteProduct(id),
    onSuccess: () => { toast.success('Product deleted'); qc.invalidateQueries({ queryKey: ['vendorProducts'] }) },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : 'Failed to delete product'),
  })

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-10">
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }
  if (!account || account.role !== 'vendor') return <AccessDenied />

  const products = productsQ.data?.items ?? []
  const orders = ordersQ.data?.items ?? []
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0)
  const totalOrderValue = orders.reduce((s, o) => s + (o.total || 0), 0)

  function openAdd() {
    setEditing(null)
    setForm(EMPTY_FORM)
    setFormOpen(true)
  }
  function openEdit(p: VendorProductRow) {
    setEditing(p)
    setForm(productToForm(p))
    setFormOpen(true)
  }
  function onSubmit() {
    const body = formToBody(form)
    if (!body.name || !Number.isFinite(Number(body.pricePerUnit)) || Number(body.pricePerUnit) <= 0) {
      toast.error('Name and a valid price are required.')
      return
    }
    if (editing) updateM.mutate({ id: editing.id, body })
    else createM.mutate(body)
  }
  function onDelete(p: VendorProductRow) {
    if (typeof window !== 'undefined' && !window.confirm(`Delete "${p.name}"? This cannot be undone.`)) return
    deleteM.mutate(p.id)
  }

  const saving = createM.isPending || updateM.isPending

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground md:text-2xl">Vendor Dashboard</h1>
          <p className="text-sm text-muted-foreground">Manage your catalog and fulfil orders.</p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="h-4 w-4" /> Add product
        </Button>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon={Package} label="Products" value={String(products.length)} />
        <StatCard icon={Boxes} label="Total stock" value={totalStock.toLocaleString('en-IN')} />
        <StatCard icon={ShoppingCart} label="Active orders" value={String(orders.length)} />
        <StatCard icon={IndianRupee} label="Order value" value={inr(totalOrderValue)} />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'products' | 'orders')}>
        <TabsList>
          <TabsTrigger value="products">My Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="mt-4">
          {productsQ.isLoading ? (
            <div className="space-y-2">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : products.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <Package className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No products yet. Add your first product to start selling.</p>
              <Button className="mt-3" onClick={openAdd}><Plus className="h-4 w-4" /> Add product</Button>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                      <TableCell className="text-muted-foreground">{p.categoryName}</TableCell>
                      <TableCell className="text-foreground">{inr(p.pricePerUnit)} <span className="text-xs text-muted-foreground">/{p.unit}</span></TableCell>
                      <TableCell className={p.stock > 0 ? 'text-foreground' : 'text-destructive'}>{p.stock}</TableCell>
                      <TableCell>
                        <Badge className={PRODUCT_STATUS_COLOR[p.status] || 'bg-secondary'}>{p.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {p.featured
                          ? <Badge className="bg-brand-amber text-brand-amber-foreground">Featured</Badge>
                          : <span className="text-xs text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="inline-flex items-center gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => onDelete(p)} aria-label={`Delete ${p.name}`}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="mt-4">
          {ordersQ.isLoading ? (
            <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-10 text-center">
              <ShoppingCart className="mx-auto h-10 w-10 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">No orders containing your products yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => <VendorOrderCard key={o.id} order={o} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={formOpen} onOpenChange={(v) => { setFormOpen(v); if (!v) setEditing(null) }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit product' : 'Add product'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="vp-name">Name</Label>
              <Input id="vp-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Cotton T-shirt" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vp-desc">Description</Label>
              <Textarea id="vp-desc" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Brief product description" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="vp-cat">Category</Label>
                <Input id="vp-cat" value={form.categoryName} onChange={(e) => setForm({ ...form, categoryName: e.target.value })} placeholder="Apparel" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vp-unit">Unit</Label>
                <Input id="vp-unit" value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} placeholder="piece" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="vp-moq">MOQ</Label>
                <Input id="vp-moq" type="number" min={1} value={form.moq} onChange={(e) => setForm({ ...form, moq: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vp-price">Price / unit</Label>
                <Input id="vp-price" type="number" min={0} step="0.01" value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="vp-stock">Stock</Label>
                <Input id="vp-stock" type="number" min={0} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vp-images">Image URLs (comma separated)</Label>
              <Textarea id="vp-images" rows={2} value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })} placeholder="https://cdn.example.com/a.jpg, https://cdn.example.com/b.jpg" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vp-specs">Specs (label:value, one per line)</Label>
              <Textarea id="vp-specs" rows={3} value={form.specs} onChange={(e) => setForm({ ...form, specs: e.target.value })} placeholder={'Material:Cotton\nColor:Black'} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vp-tiers">Bulk tiers (minQty:pricePerUnit, one per line)</Label>
              <Textarea id="vp-tiers" rows={3} value={form.bulkTiers} onChange={(e) => setForm({ ...form, bulkTiers: e.target.value })} placeholder={'10:90\n50:80'} />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div>
                <Label htmlFor="vp-featured" className="cursor-pointer">Featured listing</Label>
                <p className="text-xs text-muted-foreground">Featured products appear in deal spotlight slots.</p>
              </div>
              <Switch id="vp-featured" checked={form.featured} onCheckedChange={(v) => setForm({ ...form, featured: v })} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={onSubmit} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Create product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function VendorOrderCard({ order }: { order: VendorOrderRow }) {
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
      <div className="mt-3 space-y-1.5">
        {order.items.map((it, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-foreground line-clamp-1">{it.name} <span className="text-muted-foreground">× {it.qty} {it.unit}</span></span>
            <span className="font-medium text-foreground">{inr(it.lineTotal)}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3 text-sm">
        <span className="text-muted-foreground">{addr.city || '—'}, {addr.state || '—'} {addr.pincode || ''}</span>
        <span className="font-bold text-foreground">{inr(order.total)}</span>
      </div>
    </div>
  )
}
