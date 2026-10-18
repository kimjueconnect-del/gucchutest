import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse } from '@/lib/auth'
import { publicProduct } from '@/lib/publicProduct'

// Public deals feed — includes the product snapshot but NOT vendor info.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const featured = searchParams.get('featured') === '1'
  const where: Record<string, unknown> = { active: true }
  if (featured) where.featured = true
  const deals = await db.deal.findMany({
    where,
    include: { product: true },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })
  return jsonResponse({
    items: deals
      .filter((d) => d.product && d.product.status === 'active')
      .map((d) => ({
        id: d.id,
        title: d.title,
        discountPct: d.discountPct,
        featured: d.featured,
        active: d.active,
        product: publicProduct(d.product),
      })),
  })
}
