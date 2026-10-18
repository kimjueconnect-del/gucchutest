import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse, sanitizeText, isName } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const deals = await db.deal.findMany({
    include: { product: { select: { name: true, id: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return jsonResponse({ items: deals })
}

export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const productId = String(body.productId || '')
  const title = sanitizeText(String(body.title || ''), 100)
  if (!isName(title)) return errorResponse('Valid deal title required.', 400)
  const discountPct = Number(body.discountPct)
  if (!Number.isFinite(discountPct) || discountPct <= 0 || discountPct > 90) return errorResponse('Discount must be 1–90%.', 400)
  const product = await db.product.findUnique({ where: { id: productId } })
  if (!product) return errorResponse('Product not found.', 404)
  const deal = await db.deal.create({
    data: { productId, title, discountPct, active: body.active !== false, featured: !!body.featured },
  })
  return jsonResponse({ ok: true, deal })
}
