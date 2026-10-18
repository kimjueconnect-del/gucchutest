'use client'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({ rating, size = 14, className = '', showNumber = false }: { rating: number; size?: number; className?: string; showNumber?: boolean }) {
  const rounded = Math.round(rating * 2) / 2
  return (
    <span className={cn('inline-flex items-center gap-1', className)}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => {
          const fill = rounded >= i ? 1 : rounded >= i - 0.5 ? 0.5 : 0
          return (
            <span key={i} className="relative" style={{ width: size, height: size }}>
              <Star size={size} className="absolute inset-0 text-muted-foreground/30" fill="currentColor" />
              {fill > 0 && (
                <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                  <Star size={size} className="text-brand-amber" fill="currentColor" />
                </span>
              )}
            </span>
          )
        })}
      </span>
      {showNumber && <span className="text-xs font-medium text-muted-foreground">{rating.toFixed(1)}</span>}
    </span>
  )
}
