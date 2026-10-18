import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { jsonResponse, errorResponse } from '@/lib/auth'
import { publicProduct } from '@/lib/publicProduct'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const product = await db.product.findFirst({
    where: { OR: [{ id }, { slug: id }], status: 'active' },
    include: { reviews: { include: { buyer: true }, orderBy: { createdAt: 'desc' }, take: 20 } },
  })
  if (!product) return errorResponse('Product not found.', 404)

  const pub = publicProduct(product)
  const reviews = product.reviews.map((r) => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    buyerName: r.buyer.name,
  }))
  return jsonResponse({ ...pub, reviews })
}
