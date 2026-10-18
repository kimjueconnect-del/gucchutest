'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useWishlistStore, useNavStore } from '@/lib/store'
import { ProductCard } from '@/components/shared/ProductCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Heart, ChevronLeft } from 'lucide-react'

export function WishlistView() {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const ids = useWishlistStore((s) => s.ids)

  // Fetch all products in the wishlist. We query by one ID at a time via the
  // list endpoint — but since our API doesn't support multi-ID fetch, we
  // fetch a larger page and filter client-side. For a trial this is fine.
  const q = useQuery({
    queryKey: ['products', { wishlist: true, limit: 40 }],
    queryFn: () => apiClient.products({ limit: 40 }),
    enabled: ids.length > 0,
  })

  const items = q.data?.items?.filter((p) => ids.includes(p.id)) || []

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-4 flex items-center gap-2">
        <Heart className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Your wishlist</h1>
        {ids.length > 0 && <span className="text-sm text-muted-foreground">({ids.length})</span>}
      </div>

      {ids.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No saved items yet. Tap the heart on any product to save it for later.</p>
          <Button variant="link" onClick={() => navigate({ name: 'home' })}>Browse products</Button>
        </div>
      ) : q.isLoading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-[3/4] rounded-xl" />)}
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted-foreground">Your saved items are no longer available.</p>
        </div>
      )}
    </div>
  )
}
