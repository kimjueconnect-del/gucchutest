import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse } from '@/lib/auth'
import { safeJson } from '@/lib/guards'
import { isStrongPassword, rateLimit, getClientIp, isName, isEmail } from '@/lib/auth'

// POST a review on a product (buyer only).
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: productId } = await params
  const ip = getClientIp(req)
  const rl = rateLimit(`review:${ip}`, 5, 60_000)
  if (!rl.ok) return errorResponse('Too many actions. Slow down.', 429)

  const account = await getAccountFromRequest(req)
  if (!account) return errorResponse('Login required to review.', 401)

  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const rating = Math.round(Number(body.rating))
  const comment = String(body.comment || '').slice(0, 500).replace(/<[^>]*>/g, '')
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return errorResponse('Rating must be 1–5.', 400)
  if (!comment || comment.length < 3) return errorResponse('Please write a short comment.', 400)

  const product = await db.product.findFirst({ where: { OR: [{ id: productId }, { slug: productId }] } })
  if (!product) return errorResponse('Product not found.', 404)

  const review = await db.review.create({ data: { productId: product.id, buyerId: account.id, rating, comment } })
  return jsonResponse({ ok: true, review })
}
