import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse } from '@/lib/auth'
import { publicProduct } from '@/lib/publicProduct'

// GET /api/products?q=&category=&sort=&page=&limit=&featured=
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = (searchParams.get('q') || '').trim().slice(0, 100)
  const category = (searchParams.get('category') || '').trim().slice(0, 60)
  const sort = (searchParams.get('sort') || 'popular').slice(0, 20)
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10) || 1)
  const limit = Math.min(40, Math.max(1, parseInt(searchParams.get('limit') || '12', 10) || 12))
  const featured = searchParams.get('featured') === '1'

  const where: Record<string, unknown> = { status: 'active' }
  if (featured) where.featured = true
  if (category) where.categoryName = { contains: category }
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
      { categoryName: { contains: q } },
    ]
  }

  let orderBy: Record<string, string> = { createdAt: 'desc' }
  if (sort === 'price-asc') orderBy = { pricePerUnit: 'asc' }
  else if (sort === 'price-desc') orderBy = { pricePerUnit: 'desc' }
  else if (sort === 'rating') orderBy = { rating: 'desc' }
  else if (sort === 'popular') orderBy = { rating: 'desc' }

  const [total, items] = await Promise.all([
    db.product.count({ where }),
    db.product.findMany({ where, orderBy, skip: (page - 1) * limit, take: limit }),
  ])

  return jsonResponse({
    items: items.map(publicProduct),
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  })
}
