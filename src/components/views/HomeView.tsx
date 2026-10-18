'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useUIStore, useNavStore, useRecentStore } from '@/lib/store'
import { ProductCard } from '@/components/shared/ProductCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import { inr } from '@/lib/format'
import { Truck, ShieldCheck, Tag, MapPin, ArrowRight, PackageCheck, Layers, Building2 } from 'lucide-react'

const CATEGORY_ICONS: Record<string, string> = {
  'Furniture': 'Sofa',
  'Lighting & Electrical': 'Lightbulb',
  'Home Decor': 'Frame',
  'Kitchen & Cookware': 'CookingPot',
  'Building & Hardware': 'Hammer',
}

export function HomeView() {
  const { query, category, setCategory, sort, setSort, scrollSignal, triggerScroll } = useUIStore()
  const navigate = useNavStore((s) => s.navigate)
  const recentIds = useRecentStore((s) => s.ids)
  const [page, setPage] = useState(1)

  // Scroll to the product grid whenever the scroll signal fires (category
  // clicks from the header, mobile menu, or shop-by-category section).
  useEffect(() => {
    if (scrollSignal > 0) {
      const t = setTimeout(() => {
        document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
      return () => clearTimeout(t)
    }
  }, [scrollSignal])

  const productsQ = useQuery({
    queryKey: ['products', { q: query, category, sort, page }],
    queryFn: () => apiClient.products({ q: query, category, sort, page, limit: 12 }),
  })
  const dealsQ = useQuery({ queryKey: ['deals', 'featured'], queryFn: () => apiClient.deals(true) })
  const marketsQ = useQuery({ queryKey: ['markets'], queryFn: () => apiClient.markets })
  const activeMarket = marketsQ.data?.items?.find((m) => m.active)
  // Recently viewed — fetch the first page and filter to the user's recent IDs.
  const recentQ = useQuery({
    queryKey: ['products', { recent: true, limit: 40 }],
    queryFn: () => apiClient.products({ limit: 40 }),
    enabled: recentIds.length > 0,
  })
  const recentItems = recentQ.data?.items?.filter((p) => recentIds.includes(p.id)).sort((a, b) => recentIds.indexOf(a.id) - recentIds.indexOf(b.id)).slice(0, 6) || []

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
      {/* Hero */}
      <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-card">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="flex flex-col justify-center gap-3 p-6 md:p-8">
            <Badge variant="secondary" className="w-fit gap-1.5">
              <MapPin className="h-3 w-3 text-primary" /> {activeMarket?.name || 'Delhi Wholesale Market'}
            </Badge>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground md:text-3xl">
              Buy wholesale in bulk, directly from Delhi&apos;s biggest markets.
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Verified vendors, transparent bulk pricing, and integrated transport — delivered pan-India. Furniture, electricals, decor, hardware and more, all in one organised marketplace.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button onClick={() => triggerScroll()}>
                Browse products <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigate({ name: 'deals' })}>
                <Tag className="mr-1 h-4 w-4" /> Today&apos;s deals
              </Button>
            </div>
          </div>
          <div className="relative hidden min-h-[240px] bg-secondary md:block">
            <img
              src="https://z-cdn.chatglm.cn/image-search-mcp/images-ppt/debfe5dedff9.jpg"
              alt="Delhi wholesale furniture"
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-4 right-4 rounded-lg bg-card/95 p-3 shadow-md backdrop-blur">
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span className="font-medium">Verified &amp; quality-checked</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { icon: ShieldCheck, title: 'Verified vendors', desc: 'Personally onboarded & quality-checked' },
          { icon: Truck, title: 'Integrated transport', desc: 'Auto-assigned, tracked delivery' },
          { icon: PackageCheck, title: 'Bulk MOQ pricing', desc: 'Pay less as you buy more' },
          { icon: MapPin, title: 'Pan-India delivery', desc: 'From Delhi to your doorstep' },
        ].map((b) => (
          <div key={b.title} className="flex items-start gap-2.5 rounded-xl border border-border bg-card p-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <b.icon className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{b.title}</p>
              <p className="text-xs text-muted-foreground">{b.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Deals strip */}
      {dealsQ.data && dealsQ.data.items.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
              <Tag className="h-5 w-5 text-brand-amber" /> Featured deals
            </h2>
            <Button variant="link" className="h-auto p-0 text-sm" onClick={() => navigate({ name: 'deals' })}>
              View all <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {dealsQ.data.items.slice(0, 6).map((d) => (
              <button
                key={d.id}
                onClick={() => navigate({ name: 'product', productId: d.product.id })}
                className="group relative w-40 shrink-0 overflow-hidden rounded-xl border border-border bg-card text-left transition-shadow hover:shadow-md md:w-48"
              >
                <div className="relative aspect-square overflow-hidden bg-muted">
                  <img src={d.product.images[0] || '/logo.svg'} alt={d.product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" loading="lazy" />
                  <span className="absolute left-2 top-2 rounded-md bg-brand-amber px-1.5 py-0.5 text-xs font-bold">-{Math.round(d.discountPct)}%</span>
                </div>
                <div className="p-2.5">
                  <p className="line-clamp-1 text-xs font-medium text-foreground">{d.product.name}</p>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-sm font-bold text-foreground">{inr(d.product.pricePerUnit * (1 - d.discountPct / 100))}</span>
                    <span className="text-[10px] text-muted-foreground line-through">{inr(d.product.pricePerUnit)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Categories quick links */}
      <section className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Shop by category</h2>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {[
            { name: 'Furniture', label: 'Furniture' },
            { name: 'Lighting & Electrical', label: 'Lighting' },
            { name: 'Home Decor', label: 'Decor' },
            { name: 'Kitchen & Cookware', label: 'Kitchen' },
            { name: 'Building & Hardware', label: 'Hardware' },
          ].map((c) => (
            <button
              key={c.name}
              onClick={() => { setCategory(c.name); triggerScroll() }}
              className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-colors ${category === c.name ? 'border-primary bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`}
            >
              <div className="rounded-lg bg-secondary p-2">
                <Building2 className="h-4 w-4 text-foreground" />
              </div>
              <span className="text-xs font-medium text-foreground">{c.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Product grid */}
      <section id="product-grid" className="scroll-mt-32">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-foreground">
              {query ? `Results for "${query}"` : category ? category : 'All products'}
            </h2>
            {productsQ.data && <span className="text-sm text-muted-foreground">({productsQ.data.total})</span>}
          </div>
          <div className="flex items-center gap-2">
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="h-9 w-[150px]"><SelectValue placeholder="Sort" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Popularity</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {productsQ.isLoading ? (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card p-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-2 h-4 w-1/2" />
                <Skeleton className="mt-2 h-8 w-full" />
              </div>
            ))}
          </div>
        ) : productsQ.data && productsQ.data.items.length > 0 ? (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {productsQ.data.items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
            {productsQ.data.pages > 1 && (
              <div className="mt-6 flex items-center justify-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
                <span className="text-sm text-muted-foreground">Page {page} of {productsQ.data.pages}</span>
                <Button variant="outline" size="sm" disabled={page >= productsQ.data.pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            )}
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted-foreground">No products found. Try a different search or category.</p>
            <Button variant="link" onClick={() => { useUIStore.getState().setQuery(''); setCategory('') }}>Clear filters</Button>
          </div>
        )}
      </section>

      {/* Recently viewed */}
      {recentItems.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-foreground">Recently viewed</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {recentItems.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
