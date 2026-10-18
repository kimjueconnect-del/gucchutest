'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useNavStore } from '@/lib/store'
import { ProductCard } from '@/components/shared/ProductCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Tag, ChevronLeft } from 'lucide-react'

export function DealsView() {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const q = useQuery({ queryKey: ['deals', 'all'], queryFn: () => apiClient.deals() })

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-4 flex items-center gap-2">
        <Tag className="h-6 w-6 text-brand-amber" />
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Today&apos;s deals</h1>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">Bulk-buy favourites at limited-time discounts. Prices update automatically based on your order quantity.</p>

      {q.isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
        </div>
      ) : q.data && q.data.items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {q.data.items.map((d) => (
            <ProductCard key={d.id} product={d.product} discountPct={d.discountPct} />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
          No active deals right now. Check back soon.
          <div><Button variant="link" onClick={() => navigate({ name: 'home' })}>Browse all products</Button></div>
        </div>
      )}
    </div>
  )
}
