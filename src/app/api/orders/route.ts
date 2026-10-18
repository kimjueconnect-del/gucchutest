import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse, rateLimit, getClientIp, sanitizeText, isName } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

// Effective unit price given a quantity and bulk tiers (descending tier match).
function effectivePrice(base: number, tiers: { minQty: number; pricePerUnit: number }[], qty: number) {
  const sorted = [...tiers].sort((a, b) => b.minQty - a.minQty)
  for (const t of sorted) {
    if (qty >= t.minQty) return t.pricePerUnit
  }
  return base
}

// POST /api/orders  — place an order. Prices recomputed server-side.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`order:${ip}`, 5, 60_000)
  if (!rl.ok) return errorResponse('Too many orders. Please wait.', 429)

  const account = await getAccountFromRequest(req)
  if (!account) return errorResponse('Login required to place an order.', 401)

  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const rawItems = Array.isArray(body.items) ? body.items : []
  if (rawItems.length === 0) return errorResponse('Your cart is empty.', 400)
  if (rawItems.length > 50) return errorResponse('Too many items.', 400)

  const address = body.deliveryAddress
  if (!address || typeof address !== 'object') return errorResponse('Delivery address required.', 400)
  const a = address as Record<string, unknown>
  const line1 = sanitizeText(String(a.line1 || ''), 200)
  const city = sanitizeText(String(a.city || ''), 80)
  const state = sanitizeText(String(a.state || ''), 80)
  const pincode = sanitizeText(String(a.pincode || ''), 12)
  const phone = sanitizeText(String(a.phone || ''), 18)
  const buyerName = sanitizeText(String(a.name || account.name), 80)
  if (!line1 || !city || !state || !pincode || !phone || !isName(buyerName)) {
    return errorResponse('Please complete all delivery address fields.', 400)
  }

  // Resolve products
  const ids = rawItems.map((i) => String((i as Record<string, unknown>).productId || ''))
  const products = await db.product.findMany({ where: { id: { in: ids }, status: 'active' } })
  const byId = new Map(products.map((p) => [p.id, p]))

  type OrderLine = { productId: string; name: string; unit: string; qty: number; pricePerUnit: number; lineTotal: number; image: string }
  const lines: OrderLine[] = []
  let subtotal = 0
  for (const it of rawItems) {
    const productId = String((it as Record<string, unknown>).productId || '')
    let qty = Math.floor(Number((it as Record<string, unknown>).qty) || 0)
    const p = byId.get(productId)
    if (!p) continue
    if (qty < p.moq) qty = p.moq
    if (qty > p.stock) qty = p.stock
    if (qty <= 0) continue
    let tiers: { minQty: number; pricePerUnit: number }[] = []
    try { tiers = JSON.parse(p.bulkTiers) } catch { tiers = [] }
    const price = effectivePrice(p.pricePerUnit, tiers, qty)
    const lineTotal = price * qty
    subtotal += lineTotal
    let imgs: string[] = []
    try { imgs = JSON.parse(p.images) } catch { imgs = [] }
    lines.push({ productId: p.id, name: p.name, unit: p.unit, qty, pricePerUnit: price, lineTotal, image: imgs[0] || '' })
  }

  if (lines.length === 0) return errorResponse('No valid items to order.', 400)

  // Transport assignment: exclusive verified first, then any verified.
  const transport = await db.transportProfile.findFirst({
    where: { verified: true, exclusive: true },
    orderBy: { rating: 'desc' },
  }) || await db.transportProfile.findFirst({
    where: { verified: true },
    orderBy: { rating: 'desc' },
  })

  // Transport fee estimate: base + per line + distance proxy from pincode region.
  const transportFee = transport ? Math.round((transport.baseRate || 15) * 30 + lines.length * 120 + 300) : 500

  const total = subtotal + transportFee

  const order = await db.order.create({
    data: {
      buyerId: account.id,
      items: JSON.stringify(lines),
      subtotal,
      discount: 0,
      transportFee,
      total,
      status: transport ? 'assigned' : 'placed',
      deliveryAddress: JSON.stringify({ line1, city, state, pincode, phone, name: buyerName }),
      transportId: transport?.id || null,
      salesPersonId: null,
      salesCommission: 0,
    },
  })

  // Decrement stock
  for (const ln of lines) {
    await db.product.update({ where: { id: ln.productId }, data: { stock: { decrement: ln.qty } } })
  }

  return jsonResponse({ ok: true, order: { id: order.id, total: order.total, status: order.status, transportAssigned: !!transport } })
}

// GET /api/orders — list the current user's orders.
export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account) return errorResponse('Login required.', 401)

  const orders = await db.order.findMany({
    where: { buyerId: account.id },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return jsonResponse({
    items: orders.map((o) => ({
      id: o.id,
      items: JSON.parse(o.items),
      subtotal: o.subtotal,
      transportFee: o.transportFee,
      total: o.total,
      status: o.status,
      deliveryAddress: JSON.parse(o.deliveryAddress),
      createdAt: o.createdAt,
    })),
  })
}
