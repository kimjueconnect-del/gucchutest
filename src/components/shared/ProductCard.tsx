'use client'
import { useNavStore, useCartStore, useWishlistStore, type ProductPublic } from '@/lib/store'
import { inr } from '@/lib/format'
import { StarRating } from './StarRating'
import { ShieldCheck, Layers, Star, Heart } from 'lucide-react'
import { toast } from 'sonner'

export function ProductCard({ product, discountPct }: { product: ProductPublic; discountPct?: number }) {
  const navigate = useNavStore((s) => s.navigate)
  const add = useCartStore((s) => s.add)
  const wishlistToggle = useWishlistStore((s) => s.toggle)
  const inWishlist = useWishlistStore((s) => s.ids.includes(product.id))
  const img = product.images[0] || '/logo.svg'

  return (
    <div
      onClick={() => navigate({ name: 'product', productId: product.id })}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/40 hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={img}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {discountPct ? (
          <span className="absolute left-2 top-2 rounded-md bg-brand-amber px-2 py-0.5 text-xs font-bold">
            -{Math.round(discountPct)}%
          </span>
        ) : null}
        {product.featured && !discountPct ? (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
            <Star size={10} fill="currentColor" /> Featured
          </span>
        ) : null}
        <button
          onClick={(e) => {
            e.stopPropagation()
            wishlistToggle(product.id)
            toast.success(inWishlist ? 'Removed from wishlist' : 'Saved to wishlist')
          }}
          aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-card/90 shadow-sm backdrop-blur transition-colors hover:bg-card"
        >
          <Heart className={`h-4 w-4 ${inWishlist ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Layers size={11} />
          <span className="truncate">{product.categoryName}</span>
        </div>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">{product.name}</h3>
        <div className="flex items-center gap-1.5">
          <StarRating rating={product.rating} size={12} />
          <span className="text-[11px] text-muted-foreground">{product.rating ? product.rating.toFixed(1) : 'New'}</span>
        </div>

        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-foreground">{inr(product.pricePerUnit)}</span>
            <span className="text-[11px] text-muted-foreground">/{product.unit}</span>
          </div>
          <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
            <ShieldCheck size={11} className="text-primary" />
            <span>MOQ: {product.moq} {product.unit}</span>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation()
            add({
              productId: product.id,
              name: product.name,
              image: img,
              unit: product.unit,
              qty: product.moq,
              pricePerUnit: product.pricePerUnit,
              moq: product.moq,
            })
          }}
          className="mt-1 w-full rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-secondary-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Add to cart
        </button>
      </div>
    </div>
  )
}
