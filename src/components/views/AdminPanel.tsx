'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  LayoutDashboard, Package, Store, Truck, Users, Tag, ShoppingCart,
  ShieldCheck, Plus, Trash2, Star, BadgeCheck,
} from 'lucide-react'

import { apiClient } from '@/lib/api'
import type {
  AdminStats, AdminProductRow, AdminVendorRow, AdminTransportRow,
  AdminSalesRow, AdminDealRow, AdminOrderRow,
} from '@/lib/api'
import { useAuthStore, useNavStore } from '@/lib/store'
import { inr, dateShort } from '@/lib/format'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/switch'
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// ============================================================
// Status badge colors (shared across orders + breakdowns)
// ============================================================
const STATUS_COLOR: Record<string, string> = {
  placed: 'bg-secondary text-secondary-foreground',
  assigned: 'bg-primary/10 text-primary',
  in_transit: 'bg-brand-amber text-brand-amber-foreground',
  delivered: 'bg-primary text-primary-foreground',
  cancelled: 'bg-destructive/10 text-destructive',
}

function statusBadge(status: string) {
  return (
    <Badge className={STATUS_COLOR[status] || 'bg-secondary text-secondary-foreground'}>
      {status.replace('_', ' ')}
    </Badge>
  )
}

// ============================================================
// Main entry — guards access to admins only.
// ============================================================
export function AdminPanel() {
  const hydrated = useAuthStore((s) => s.hydrated)
  const account = useAuthStore((s) => s.account)
  const navigate = useNavStore((s) => s.navigate)

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
        <Skeleton className="mb-4 h-8 w-48" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-4 h-64 rounded-xl" />
      </div>
    )
  }

  if (!account || account.role !== 'admin') {
    return (
      <div className="mx-auto max-w-2xl px-3 py-16 text-center">
        <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground" />
        <h2 className="mt-2 text-xl font-bold text-foreground">Admin access required</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          You need to be signed in as an administrator to view this page.
        </p>
        <Button className="mt-3" onClick={() => navigate({ name: 'login' })}>Go to login</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Admin panel</h1>
        <p className="text-sm text-muted-foreground">Manage products, vendors, transport, sales reps, deals and orders.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex h-auto w-full flex-wrap gap-1 bg-muted/60 p-1">
          <TabsTrigger value="overview" className="gap-1.5"><LayoutDashboard className="h-3.5 w-3.5" />Overview</TabsTrigger>
          <TabsTrigger value="products" className="gap-1.5"><Package className="h-3.5 w-3.5" />Products</TabsTrigger>
          <TabsTrigger value="vendors" className="gap-1.5"><Store className="h-3.5 w-3.5" />Vendors</TabsTrigger>
          <TabsTrigger value="transport" className="gap-1.5"><Truck className="h-3.5 w-3.5" />Transport</TabsTrigger>
          <TabsTrigger value="sales" className="gap-1.5"><Users className="h-3.5 w-3.5" />Sales</TabsTrigger>
          <TabsTrigger value="deals" className="gap-1.5"><Tag className="h-3.5 w-3.5" />Deals</TabsTrigger>
          <TabsTrigger value="orders" className="gap-1.5"><ShoppingCart className="h-3.5 w-3.5" />Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4"><OverviewTab /></TabsContent>
        <TabsContent value="products" className="mt-4"><ProductsTab /></TabsContent>
        <TabsContent value="vendors" className="mt-4"><VendorsTab /></TabsContent>
        <TabsContent value="transport" className="mt-4"><TransportTab /></TabsContent>
        <TabsContent value="sales" className="mt-4"><SalesTab /></TabsContent>
        <TabsContent value="deals" className="mt-4"><DealsTab /></TabsContent>
        <TabsContent value="orders" className="mt-4"><OrdersTab /></TabsContent>
      </Tabs>
    </div>
  )
}

// ============================================================
// 1. Overview
// ============================================================
function OverviewTab() {
  const q = useQuery({ queryKey: ['admin', 'stats'], queryFn: () => apiClient.adminStats() })

  if (q.isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
    )
  }

  if (!q.data) {
    return <p className="text-sm text-muted-foreground">Failed to load stats.</p>
  }

  const s: AdminStats = q.data
  const stats: { label: string; value: string }[] = [
    { label: 'Revenue', value: inr(s.revenue) },
    { label: 'Orders', value: String(s.orders) },
    { label: 'Products', value: String(s.products) },
    { label: 'Vendors', value: String(s.vendors) },
    { label: 'Transport partners', value: String(s.transport) },
    { label: 'Sales reps', value: String(s.sales) },
    { label: 'Buyers', value: String(s.buyers) },
    { label: 'Active deals', value: String(s.deals) },
  ]

  const orderStatuses = Object.entries(s.ordersByStatus || {})

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((st) => (
          <Card key={st.label}>
            <CardHeader className="pb-2">
              <p className="text-xs font-medium text-muted-foreground">{st.label}</p>
              <p className="text-lg font-bold text-foreground md:text-2xl">{st.value}</p>
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orders by status</CardTitle>
        </CardHeader>
        <CardContent>
          {orderStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            <ul className="space-y-2">
              {orderStatuses.map(([status, count]) => (
                <li key={status} className="flex items-center justify-between gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    {statusBadge(status)}
                    <span className="text-muted-foreground capitalize">{status.replace('_', ' ')}</span>
                  </div>
                  <span className="font-semibold text-foreground">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============================================================
// Shared mutation helper — runs the call, toasts + invalidates.
// ============================================================
function useAdminMut() {
  const qc = useQueryClient()
  return async (
    label: string,
    run: () => Promise<{ ok?: boolean } | void>,
    keys: (string | string[])[],
  ) => {
    try {
      await run()
      for (const k of keys) qc.invalidateQueries({ queryKey: Array.isArray(k) ? k : ['admin', k] })
      toast.success(`${label} updated`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : `${label} failed`)
    }
  }
}

// ============================================================
// 2. Products
// ============================================================
function ProductsTab() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'products'], queryFn: () => apiClient.adminProducts() })
  const mut = useAdminMut()

  const toggleFeatured = (p: AdminProductRow) =>
    mut('Product', () => apiClient.adminUpdateProduct(p.id, { featured: !p.featured }), ['products'])
  const toggleStatus = (p: AdminProductRow) =>
    mut('Product', () => apiClient.adminUpdateProduct(p.id, { status: p.status === 'active' ? 'blocked' : 'active' }), ['products'])
  const remove = async (p: AdminProductRow) => {
    try {
      await apiClient.adminDeleteProduct(p.id)
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Product deleted')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">All products</h2>
        <AddProductDialog />
      </div>

      {q.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !q.data || q.data.items.length === 0 ? (
        <EmptyState label="No products yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data.items.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium text-foreground">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">{p.categoryName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <span className="text-foreground">{p.vendor.businessName}</span>
                      {p.vendor.exclusive && <Badge className="bg-brand-amber text-brand-amber-foreground">Exclusive</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{inr(p.pricePerUnit)}</TableCell>
                  <TableCell className="text-right tabular-nums">{p.stock}</TableCell>
                  <TableCell>
                    <Badge className={p.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>
                      {p.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Switch checked={p.featured} onCheckedChange={() => toggleFeatured(p)} aria-label="Toggle featured" />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button size="sm" variant="outline" onClick={() => toggleStatus(p)}>
                        {p.status === 'active' ? 'Block' : 'Activate'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" aria-label="Delete product"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete product?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove &ldquo;{p.name}&rdquo;. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(p)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function AddProductDialog() {
  const qc = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [moq, setMoq] = useState('1')
  const [stock, setStock] = useState('0')
  const [unit, setUnit] = useState('piece')
  const [categoryName, setCategoryName] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [images, setImages] = useState('')
  const [featured, setFeatured] = useState(false)
  const [saving, setSaving] = useState(false)

  const vendorsQ = useQuery({ queryKey: ['admin', 'vendors'], queryFn: () => apiClient.adminVendors() })

  const reset = () => {
    setName(''); setDescription(''); setPricePerUnit(''); setMoq('1'); setStock('0')
    setUnit('piece'); setCategoryName(''); setVendorId(''); setImages(''); setFeatured(false)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !pricePerUnit || !vendorId) {
      toast.error('Name, price and vendor are required')
      return
    }
    setSaving(true)
    try {
      await apiClient.adminCreateProduct({
        name, description, pricePerUnit: Number(pricePerUnit),
        moq: Number(moq), stock: Number(stock), unit, categoryName,
        vendorId, images, featured,
      })
      toast.success('Product created')
      reset()
      setOpen(false)
      qc.invalidateQueries({ queryKey: ['admin', 'products'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Add product</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add product</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="ap-name">Name</Label>
            <Input id="ap-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label htmlFor="ap-desc">Description</Label>
            <Textarea id="ap-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="ap-price">Price per unit</Label>
              <Input id="ap-price" type="number" min="0" step="0.01" value={pricePerUnit} onChange={(e) => setPricePerUnit(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ap-moq">MOQ</Label>
              <Input id="ap-moq" type="number" min="1" value={moq} onChange={(e) => setMoq(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ap-stock">Stock</Label>
              <Input id="ap-stock" type="number" min="0" value={stock} onChange={(e) => setStock(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ap-unit">Unit</Label>
              <Input id="ap-unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ap-cat">Category</Label>
              <Input id="ap-cat" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Vendor</Label>
              <Select value={vendorId} onValueChange={setVendorId}>
                <SelectTrigger><SelectValue placeholder="Select vendor" /></SelectTrigger>
                <SelectContent>
                  {vendorsQ.data?.items?.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.businessName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="ap-img">Image URLs (comma-separated)</Label>
            <Input id="ap-img" value={images} onChange={(e) => setImages(e.target.value)} placeholder="https://..., https://..." />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="ap-feat" className="cursor-pointer">Featured</Label>
            <Switch id="ap-feat" checked={featured} onCheckedChange={setFeatured} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create product'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}


// ============================================================
// 3. Vendors
// ============================================================
function VendorsTab() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'vendors'], queryFn: () => apiClient.adminVendors() })
  const mut = useAdminMut()

  const update = (v: AdminVendorRow, patch: Record<string, unknown>, label = 'Vendor') =>
    mut(label, () => apiClient.adminUpdateVendor(v.id, patch), ['vendors', 'stats'])
  const remove = async (v: AdminVendorRow) => {
    try {
      await apiClient.adminDeleteVendor(v.id)
      toast.success('Vendor deleted')
      qc.invalidateQueries({ queryKey: ['admin', 'vendors'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Vendors</h2>
      {q.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !q.data || q.data.items.length === 0 ? (
        <EmptyState label="No vendors yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Market</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Exclusive</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data.items.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium text-foreground">{v.businessName}</TableCell>
                  <TableCell className="text-muted-foreground">{v.market || '—'}</TableCell>
                  <TableCell className="text-xs">
                    <div className="text-foreground">{v.account.email}</div>
                    <div className="text-muted-foreground">{v.account.phone || '—'}</div>
                  </TableCell>
                  <TableCell>
                    <Switch checked={v.exclusive} onCheckedChange={(c) => update(v, { exclusive: c }, 'Vendor exclusive')} aria-label="Toggle exclusive" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={v.verified} onCheckedChange={(c) => update(v, { verified: c }, 'Vendor verified')} aria-label="Toggle verified" />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 text-brand-amber" />{v.rating ? v.rating.toFixed(1) : '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge className={v.account.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>
                      {v.account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => update(v, { status: v.account.status === 'active' ? 'suspended' : 'active' }, 'Vendor status')}
                      >
                        {v.account.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" aria-label="Delete vendor"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete vendor?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove &ldquo;{v.businessName}&rdquo; and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(v)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 4. Transport
// ============================================================
function TransportTab() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'transport'], queryFn: () => apiClient.adminTransport() })
  const mut = useAdminMut()

  const parseList = (s: string): string[] => {
    try {
      const v = JSON.parse(s)
      return Array.isArray(v) ? v.map((x) => String(x)) : []
    } catch {
      return []
    }
  }

  const update = (t: AdminTransportRow, patch: Record<string, unknown>, label = 'Transport') =>
    mut(label, () => apiClient.adminUpdateTransport(t.id, patch), ['transport', 'stats'])
  const remove = async (t: AdminTransportRow) => {
    try {
      await apiClient.adminDeleteTransport(t.id)
      toast.success('Transport partner deleted')
      qc.invalidateQueries({ queryKey: ['admin', 'transport'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Transport partners</h2>
      {q.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !q.data || q.data.items.length === 0 ? (
        <EmptyState label="No transport partners yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company</TableHead>
                <TableHead>Exclusive</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead className="text-right">Rating</TableHead>
                <TableHead className="text-right">Base rate</TableHead>
                <TableHead>Vehicles</TableHead>
                <TableHead>Coverage</TableHead>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data.items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="font-medium text-foreground">{t.companyName}</TableCell>
                  <TableCell>
                    <Switch checked={t.exclusive} onCheckedChange={(c) => update(t, { exclusive: c }, 'Transport exclusive')} aria-label="Toggle exclusive" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={t.verified} onCheckedChange={(c) => update(t, { verified: c }, 'Transport verified')} aria-label="Toggle verified" />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 text-brand-amber" />{t.rating ? t.rating.toFixed(1) : '—'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{inr(t.baseRate)}</TableCell>
                  <TableCell className="max-w-[180px]">
                    <span className="text-xs text-muted-foreground">{parseList(t.vehicleTypes).join(', ') || '—'}</span>
                  </TableCell>
                  <TableCell className="max-w-[180px]">
                    <span className="text-xs text-muted-foreground">{parseList(t.coverageAreas).join(', ') || '—'}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={t.account.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>
                      {t.account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => update(t, { status: t.account.status === 'active' ? 'suspended' : 'active' }, 'Transport status')}
                      >
                        {t.account.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" aria-label="Delete transport"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete transport partner?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove &ldquo;{t.companyName}&rdquo; and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(t)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

// ============================================================
// 5. Sales reps
// ============================================================
function SalesTab() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'sales'], queryFn: () => apiClient.adminSales() })
  const mut = useAdminMut()

  const update = (s: AdminSalesRow, patch: Record<string, unknown>, label = 'Sales rep') =>
    mut(label, () => apiClient.adminUpdateSales(s.id, patch), ['sales', 'stats'])
  const remove = async (s: AdminSalesRow) => {
    try {
      await apiClient.adminDeleteSales(s.id)
      toast.success('Sales rep deleted')
      qc.invalidateQueries({ queryKey: ['admin', 'sales'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Sales representatives</h2>
      {q.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !q.data || q.data.items.length === 0 ? (
        <EmptyState label="No sales reps yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Region</TableHead>
                <TableHead>Commission</TableHead>
                <TableHead className="text-right">Total earned</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data.items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium text-foreground">{s.account.name}</div>
                    <div className="text-xs text-muted-foreground">{s.account.email}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{s.region || '—'}</TableCell>
                  <TableCell>
                    <EditCommissionDialog
                      current={s.commissionPct}
                      onSave={(pct) => update(s, { commissionPct: pct }, 'Commission')}
                    />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{inr(s.totalEarned)}</TableCell>
                  <TableCell>
                    <Badge className={s.account.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-destructive/10 text-destructive'}>
                      {s.account.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => update(s, { accountStatus: s.account.status === 'active' ? 'suspended' : 'active' }, 'Sales status')}
                      >
                        {s.account.status === 'active' ? 'Suspend' : 'Activate'}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="destructive" aria-label="Delete sales rep"><Trash2 className="h-3.5 w-3.5" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete sales rep?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently remove &ldquo;{s.account.name}&rdquo; and cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => remove(s)}>Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function EditCommissionDialog({ current, onSave }: { current: number; onSave: (pct: number) => void }) {
  const [open, setOpen] = useState(false)
  const [val, setVal] = useState(String(current))

  const submit = () => {
    const n = Number(val)
    if (!Number.isFinite(n) || n < 0 || n > 100) {
      toast.error('Commission must be between 0 and 100')
      return
    }
    onSave(n)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setVal(String(current)) }}>
      <DialogTrigger asChild>
        <button className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-muted">
          {current}%<BadgeCheck className="h-3 w-3 text-primary" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit commission %</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="comm-pct">Commission percentage</Label>
          <Input id="comm-pct" type="number" min="0" max="100" step="0.1" value={val} onChange={(e) => setVal(e.target.value)} />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={submit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// 6. Deals
// ============================================================
function DealsTab() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'deals'], queryFn: () => apiClient.adminDeals() })
  const mut = useAdminMut()

  const toggleActive = (d: AdminDealRow) => mut('Deal', () => apiClient.adminUpdateDeal(d.id, { active: !d.active }), ['deals'])
  const toggleFeatured = (d: AdminDealRow) => mut('Deal', () => apiClient.adminUpdateDeal(d.id, { featured: !d.featured }), ['deals'])
  const remove = async (d: AdminDealRow) => {
    try {
      await apiClient.adminDeleteDeal(d.id)
      toast.success('Deal deleted')
      qc.invalidateQueries({ queryKey: ['admin', 'deals'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Delete failed')
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-foreground">Deals</h2>
        <CreateDealDialog />
      </div>
      {q.isLoading ? (
        <Skeleton className="h-64 rounded-xl" />
      ) : !q.data || q.data.items.length === 0 ? (
        <EmptyState label="No deals yet." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead>Active</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {q.data.items.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium text-foreground">{d.title}</TableCell>
                  <TableCell className="text-muted-foreground">{d.product?.name || '—'}</TableCell>
                  <TableCell className="text-right tabular-nums">{d.discountPct}%</TableCell>
                  <TableCell>
                    <Switch checked={d.active} onCheckedChange={() => toggleActive(d)} aria-label="Toggle active" />
                  </TableCell>
                  <TableCell>
                    <Switch checked={d.featured} onCheckedChange={() => toggleFeatured(d)} aria-label="Toggle featured" />
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="destructive" aria-label="Delete deal"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete deal?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently remove &ldquo;{d.title}&rdquo; and cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => remove(d)}>Delete</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

function CreateDealDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [discountPct, setDiscountPct] = useState('10')
  const [productId, setProductId] = useState('')
  const [active, setActive] = useState(true)
  const [featured, setFeatured] = useState(false)
  const [saving, setSaving] = useState(false)

  const qc = useQueryClient()
  const productsQ = useQuery({ queryKey: ['admin', 'products'], queryFn: () => apiClient.adminProducts() })

  const reset = () => { setTitle(''); setDiscountPct('10'); setProductId(''); setActive(true); setFeatured(false) }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !productId) {
      toast.error('Title and product are required')
      return
    }
    const pct = Number(discountPct)
    if (!Number.isFinite(pct) || pct < 1 || pct > 90) {
      toast.error('Discount must be between 1 and 90')
      return
    }
    setSaving(true)
    try {
      await apiClient.adminCreateDeal({ title, discountPct: pct, productId, active, featured })
      toast.success('Deal created')
      reset()
      setOpen(false)
      qc.invalidateQueries({ queryKey: ['admin', 'deals'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" />Create deal</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create deal</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="dl-title">Title</Label>
            <Input id="dl-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <Label>Product</Label>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
              <SelectContent>
                {productsQ.data?.items?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label htmlFor="dl-pct">Discount % (1–90)</Label>
            <Input id="dl-pct" type="number" min="1" max="90" value={discountPct} onChange={(e) => setDiscountPct(e.target.value)} required />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="dl-active" className="cursor-pointer">Active</Label>
            <Switch id="dl-active" checked={active} onCheckedChange={setActive} />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="dl-feat" className="cursor-pointer">Featured</Label>
            <Switch id="dl-feat" checked={featured} onCheckedChange={setFeatured} />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Create deal'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================
// 7. Orders
// ============================================================
function OrdersTab() {
  const qc = useQueryClient()
  const q = useQuery({ queryKey: ['admin', 'orders'], queryFn: () => apiClient.adminOrders() })

  const updateStatus = async (id: string, status: string) => {
    try {
      await apiClient.adminUpdateOrder(id, status)
      qc.invalidateQueries({ queryKey: ['admin', 'orders'] })
      qc.invalidateQueries({ queryKey: ['admin', 'stats'] })
      toast.success('Order status updated')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Update failed')
    }
  }

  if (q.isLoading) return <Skeleton className="h-64 rounded-xl" />
  if (!q.data || q.data.items.length === 0) return <EmptyState label="No orders yet." />

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-foreground">Orders</h2>
      <div className="space-y-3">
        {q.data.items.map((o) => (
          <OrderCard key={o.id} o={o} onStatusChange={(s) => updateStatus(o.id, s)} />
        ))}
      </div>
    </div>
  )
}

function OrderCard({ o, onStatusChange }: { o: AdminOrderRow; onStatusChange: (s: string) => void }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="font-mono text-xs text-muted-foreground">#{o.id.slice(-8).toUpperCase()}</p>
            <p className="text-sm font-semibold text-foreground">{dateShort(o.createdAt)}</p>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge(o.status)}
            <Select defaultValue={o.status} onValueChange={onStatusChange}>
              <SelectTrigger className="h-8 w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="placed">placed</SelectItem>
                <SelectItem value="assigned">assigned</SelectItem>
                <SelectItem value="in_transit">in_transit</SelectItem>
                <SelectItem value="delivered">delivered</SelectItem>
                <SelectItem value="cancelled">cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
          <Field label="Buyer">
            <div className="text-foreground">{o.buyer.name}</div>
            <div className="text-muted-foreground">{o.buyer.email}</div>
            {o.buyer.phone && <div className="text-muted-foreground">{o.buyer.phone}</div>}
          </Field>
          <Field label="Items">
            <div className="text-foreground">{o.items.length} line(s)</div>
            <div className="text-muted-foreground line-clamp-2">
              {o.items.map((it) => `${it.qty}× ${it.name}`).join(', ')}
            </div>
          </Field>
          <Field label="Transport">
            <div className="text-foreground">{o.transport || '—'}</div>
            <div className="text-muted-foreground">{o.salesPerson ? `Sales: ${o.salesPerson}` : 'No sales rep'}</div>
          </Field>
          <Field label="Totals">
            <div className="text-muted-foreground">Subtotal: <span className="text-foreground">{inr(o.subtotal)}</span></div>
            <div className="text-muted-foreground">Transport: <span className="text-foreground">{inr(o.transportFee)}</span></div>
            <div className="text-muted-foreground">Commission: <span className="text-foreground">{inr(o.salesCommission)}</span></div>
            <div className="font-semibold text-foreground">Total: {inr(o.total)}</div>
          </Field>
        </div>
      </CardContent>
    </Card>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      {children}
    </div>
  )
}

// ============================================================
// Small empty-state helper
// ============================================================
function EmptyState({ label }: { label: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  )
}
