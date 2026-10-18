'use client'
import { useState, useEffect, useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useNavStore, useCartStore, useAuthStore, useWishlistStore, useRecentStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { StarRating } from '@/components/shared/StarRating'
import { ProductCard } from '@/components/shared/ProductCard'
import { inr, dateShort } from '@/lib/format'
import { toast } from 'sonner'
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi,
} from '@/components/ui/carousel'
import { ShieldCheck, Truck, Package, Minus, Plus, ChevronLeft, Tag, Layers, CheckCircle2, Heart } from 'lucide-react'

export function ProductView({ productId }: { productId: string }) {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const add = useCartStore((s) => s.add)
  const account = useAuthStore((s) => s.account)
  const qc = useQueryClient()
  const wishlistToggle = useWishlistStore((s) => s.toggle)
  const inWishlist = useWishlistStore((s) => s.ids.includes(productId))
  const pushRecent = useRecentStore((s) => s.push)
  const [qty, setQty] = useState(0)
  const [reviewText, setReviewText] = useState('')
  const [reviewRating, setReviewRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [api, setApi] = useState<CarouselApi | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  // Track the active slide index so we can highlight the current thumbnail.
  useEffect(() => {
    if (!api) return
    setActiveIndex(api.selectedScrollSnap())
    api.on('select', () => setActiveIndex(api.selectedScrollSnap()))
  }, [api])

  const scrollToImage = useCallback((i: number) => { api?.scrollTo(i) }, [api])

  const q = useQuery({
    queryKey: ['product', productId],
    queryFn: () => apiClient.product(productId),
    enabled: !!productId,
  })

  // Track this product as recently viewed (must be before any early return).
  useEffect(() => { if (q.data) pushRecent(q.data.id) }, [q.data, pushRecent])

  const relatedQ = useQuery({
    queryKey: ['products', { category: q.data?.categoryName, limit: 6 }],
    queryFn: () => apiClient.products({ category: q.data?.categoryName, limit: 6 }),
    enabled: !!q.data?.categoryName,
  })

  if (q.isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-4 md:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-3">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    )
  }
  if (q.isError || !q.data) {
    return (
      <div className="mx-auto max-w-7xl px-3 py-10 text-center md:px-6">
        <p className="text-muted-foreground">Product not found.</p>
        <Button variant="link" onClick={() => navigate({ name: 'home' })}>Back to home</Button>
      </div>
    )
  }

  const p = q.data
  const effectiveQty = qty || p.moq
  // determine effective price based on qty & bulk tiers
  let price = p.pricePerUnit
  for (const t of [...p.bulkTiers].sort((a, b) => b.minQty - a.minQty)) {
    if (effectiveQty >= t.minQty) { price = t.pricePerUnit; break }
  }
  const lineTotal = price * effectiveQty

  async function submitReview() {
    if (!account) { toast.error('Please log in to leave a review.'); navigate({ name: 'login' }); return }
    if (reviewText.trim().length < 3) { toast.error('Please write a short comment.'); return }
    setSubmitting(true)
    try {
      await apiClient.addReview(productId, reviewRating, reviewText.trim())
      toast.success('Review posted')
      setReviewText('')
      qc.invalidateQueries({ queryKey: ['product', productId] })
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to post review')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Image slider */}
        <div>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <Carousel className="w-full" setApi={setApi}>
              <CarouselContent>
                {p.images.map((src, i) => (
                  <CarouselItem key={i}>
                    <div className="aspect-square bg-muted">
                      <img src={src} alt={`${p.name} view ${i + 1}`} className="h-full w-full object-cover" />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {p.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
          </div>
          {/* thumbnails — clickable, sync with the main slider */}
          {p.images.length > 1 && (
            <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar">
              {p.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => scrollToImage(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-current={activeIndex === i}
                  className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 transition-all ${activeIndex === i ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40'}`}
                >
                  <img src={src} alt={`${p.name} thumbnail ${i + 1}`} className="h-full w-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="h-3.5 w-3.5" />
              <button onClick={() => navigate({ name: 'home' })} className="hover:text-primary">{p.categoryName}</button>
            </div>
            <h1 className="mt-1 text-xl font-bold leading-tight text-foreground md:text-2xl">{p.name}</h1>
            <div className="mt-2 flex items-center gap-2">
              <StarRating rating={p.rating} size={16} showNumber />
              {p.reviews && <span className="text-xs text-muted-foreground">· {p.reviews.length} review{p.reviews.length !== 1 ? 's' : ''}</span>}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-foreground">{inr(price)}</span>
              <span className="text-sm text-muted-foreground">/ {p.unit}</span>
              {price < p.pricePerUnit && (
                <Badge variant="secondary" className="ml-auto gap-1">
                  <Tag className="h-3 w-3" /> Bulk price
                </Badge>
              )}
            </div>
            {effectiveQty > p.moq && price < p.pricePerUnit && (
              <p className="mt-1 text-xs text-primary">You save {inr((p.pricePerUnit - price) * effectiveQty)} on this order</p>
            )}

            {/* Bulk tiers */}
            {p.bulkTiers.length > 0 && (
              <div className="mt-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Bulk pricing tiers</p>
                <div className="overflow-hidden rounded-lg border border-border">
                  <table className="w-full text-sm">
                    <thead className="bg-secondary/60 text-xs text-muted-foreground">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Min quantity</th>
                        <th className="px-3 py-2 text-right font-medium">Price / {p.unit}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-t border-border">
                        <td className="px-3 py-2">{p.moq}+ (base)</td>
                        <td className="px-3 py-2 text-right">{inr(p.pricePerUnit)}</td>
                      </tr>
                      {[...p.bulkTiers].sort((a, b) => a.minQty - b.minQty).map((t) => (
                        <tr key={t.minQty} className="border-t border-border">
                          <td className="px-3 py-2">{t.minQty}+ {t.minQty <= effectiveQty && <CheckCircle2 className="ml-1 inline h-3.5 w-3.5 text-primary" />}</td>
                          <td className="px-3 py-2 text-right font-medium">{inr(t.pricePerUnit)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mt-4 flex items-center gap-3">
              <span className="text-sm font-medium text-foreground">Quantity</span>
              <div className="flex items-center rounded-lg border border-border">
                <button onClick={() => setQty((v) => Math.max(0, (v || p.moq) - 1))} className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground" aria-label="Decrease quantity">
                  <Minus className="h-4 w-4" />
                </button>
                <Input
                  type="number"
                  value={effectiveQty}
                  onChange={(e) => setQty(Math.max(p.moq, Math.floor(Number(e.target.value) || p.moq)))}
                  className="h-9 w-20 border-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                  min={p.moq}
                />
                <button onClick={() => setQty((v) => (v || p.moq) + 1)} className="px-2.5 py-1.5 text-muted-foreground hover:text-foreground" aria-label="Increase quantity">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <span className="text-xs text-muted-foreground">MOQ: {p.moq} {p.unit}</span>
            </div>

            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Line total</span>
              <span className="text-lg font-bold text-foreground">{inr(lineTotal)}</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {p.stock > 0 ? <span className="inline-flex items-center gap-1 text-primary"><Package className="h-3.5 w-3.5" /> {p.stock} in stock</span> : <span className="text-destructive">Out of stock</span>}
            </div>

            {/* CTAs */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Button
                className="flex-1"
                onClick={() => {
                  add({ productId: p.id, name: p.name, image: p.images[0] || '', unit: p.unit, qty: effectiveQty, pricePerUnit: price, moq: p.moq })
                  toast.success(`Added ${effectiveQty} ${p.unit} to cart`)
                }}
                disabled={p.stock <= 0}
              >
                Add to cart
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  add({ productId: p.id, name: p.name, image: p.images[0] || '', unit: p.unit, qty: effectiveQty, pricePerUnit: price, moq: p.moq })
                  navigate({ name: 'checkout' })
                }}
                disabled={p.stock <= 0}
              >
                Buy now
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => { wishlistToggle(p.id); toast.success(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist') }}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                title={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
              >
                <Heart className={`h-5 w-5 ${inWishlist ? 'fill-primary text-primary' : ''}`} />
              </Button>
            </div>
          </div>

          {/* assurances */}
          <div className="grid grid-cols-3 gap-2 rounded-xl border border-border bg-card p-3 text-center">
            <div className="flex flex-col items-center gap-1">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <span className="text-[11px] text-muted-foreground">Verified vendor</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Truck className="h-5 w-5 text-primary" />
              <span className="text-[11px] text-muted-foreground">Pan-India delivery</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-[11px] text-muted-foreground">Bulk MOQ pricing</span>
            </div>
          </div>

          {/* description */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="mb-2 text-sm font-semibold text-foreground">Description</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{p.description}</p>
          </div>

          {/* specs */}
          {p.specs.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="mb-2 text-sm font-semibold text-foreground">Specifications</h3>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
                {p.specs.map((s) => (
                  <div key={s.label} className="flex justify-between gap-2 border-b border-border/60 py-1 text-sm">
                    <dt className="text-muted-foreground">{s.label}</dt>
                    <dd className="font-medium text-foreground">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-bold text-foreground">Customer reviews</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-border bg-card p-4 md:col-span-1">
            <h3 className="mb-2 text-sm font-semibold">Write a review</h3>
            <div className="mb-2 flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button key={i} onClick={() => setReviewRating(i)} aria-label={`${i} stars`}>
                  <StarRating rating={i <= reviewRating ? 1 : 0} size={22} />
                </button>
              ))}
            </div>
            <Textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} placeholder="Share your experience…" className="mb-2 min-h-20 resize-none" maxLength={500} />
            <Button onClick={submitReview} disabled={submitting} className="w-full" size="sm">
              {submitting ? 'Posting…' : 'Post review'}
            </Button>
            {!account && <p className="mt-2 text-xs text-muted-foreground">Login required to review.</p>}
          </div>
          <div className="md:col-span-2">
            {p.reviews && p.reviews.length > 0 ? (
              <div className="space-y-3">
                {p.reviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">{r.buyerName}</span>
                      <span className="text-xs text-muted-foreground">{dateShort(r.createdAt)}</span>
                    </div>
                    <div className="mt-1"><StarRating rating={r.rating} size={13} /></div>
                    <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
                No reviews yet. Be the first to review this product.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Related */}
      {relatedQ.data && relatedQ.data.items.filter((x) => x.id !== p.id).length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 text-lg font-bold text-foreground">Related products</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {relatedQ.data.items.filter((x) => x.id !== p.id).slice(0, 4).map((rp) => (
              <ProductCard key={rp.id} product={rp} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
