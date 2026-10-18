import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse, rateLimit, getClientIp, sanitizeText, isName } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

// Orders linked to this sales person.
export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'sales') return errorResponse('Sales access required.', 403)
  const sp = await db.salesProfile.findUnique({ where: { accountId: account.id } })
  if (!sp) return errorResponse('Sales profile missing.', 404)

  const orders = await db.order.findMany({
    where: { salesPersonId: sp.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return jsonResponse({
    items: orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      salesCommission: o.salesCommission,
      items: JSON.parse(o.items),
      deliveryAddress: JSON.parse(o.deliveryAddress),
      createdAt: o.createdAt,
    })),
  })
}

// POST — sales person creates an order on behalf of a lead they brought in.
// This links the sales person as the company representative and earns commission.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`salesorder:${ip}`, 5, 60_000)
  if (!rl.ok) return errorResponse('Too many orders.', 429)

  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'sales') return errorResponse('Sales access required.', 403)
  const sp = await db.salesProfile.findUnique({ where: { accountId: account.id } })
  if (!sp) return errorResponse('Sales profile missing.', 404)

  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const rawItems = Array.isArray(body.items) ? body.items : []
  if (rawItems.length === 0) return errorResponse('No items.', 400)

  const address = body.deliveryAddress
  if (!address || typeof address !== 'object') return errorResponse('Delivery address required.', 400)
  const a = address as Record<string, unknown>
  const line1 = sanitizeText(String(a.line1 || ''), 200)
  const city = sanitizeText(String(a.city || ''), 80)
  const state = sanitizeText(String(a.state || ''), 80)
  const pincode = sanitizeText(String(a.pincode || ''), 12)
  const phone = sanitizeText(String(a.phone || ''), 18)
  const buyerName = sanitizeText(String(a.name || 'Lead Customer'), 80)
  if (!line1 || !city || !state || !pincode || !phone || !isName(buyerName)) {
    return errorResponse('Please complete all delivery address fields.', 400)
  }

  const ids = rawItems.map((i) => String((i as Record<string, unknown>).productId || ''))
  const products = await db.product.findMany({ where: { id: { in: ids }, status: 'active' } })
  const byId = new Map(products.map((p) => [p.id, p]))

  type Line = { productId: string; name: string; unit: string; qty: number; pricePerUnit: number; lineTotal: number; image: string }
  const lines: Line[] = []
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
    let price = p.pricePerUnit
    for (const t of [...tiers].sort((x, y) => y.minQty - x.minQty)) {
      if (qty >= t.minQty) { price = t.pricePerUnit; break }
    }
    const lineTotal = price * qty
    subtotal += lineTotal
    let imgs: string[] = []
    try { imgs = JSON.parse(p.images) } catch { imgs = [] }
    lines.push({ productId: p.id, name: p.name, unit: p.unit, qty, pricePerUnit: price, lineTotal, image: imgs[0] || '' })
  }
  if (lines.length === 0) return errorResponse('No valid items.', 400)

  // create a buyer account for the lead under a generated email (sales-referred).
  const leadEmail = `lead-${Date.now()}@sales.gucchutest.com`
  const leadAccount = await db.account.create({
    data: {
      email: leadEmail,
      passwordHash: 'lead-' + Math.random().toString(36).slice(2), // leads login via sales rep
      role: 'buyer',
      name: buyerName,
      phone,
      status: 'active',
    },
  })

  const transport = await db.transportProfile.findFirst({ where: { verified: true, exclusive: true }, orderBy: { rating: 'desc' } })
    || await db.transportProfile.findFirst({ where: { verified: true }, orderBy: { rating: 'desc' } })
  const transportFee = transport ? Math.round((transport.baseRate || 15) * 30 + lines.length * 120 + 300) : 500
  const total = subtotal + transportFee
  const commission = Math.round((subtotal * sp.commissionPct) / 100)

  const order = await db.order.create({
    data: {
      buyerId: leadAccount.id,
      items: JSON.stringify(lines),
      subtotal,
      transportFee,
      total,
      status: transport ? 'assigned' : 'placed',
      deliveryAddress: JSON.stringify({ line1, city, state, pincode, phone, name: buyerName }),
      transportId: transport?.id || null,
      salesPersonId: sp.id,
      salesCommission: commission,
    },
  })

  await db.salesProfile.update({ where: { id: sp.id }, data: { totalEarned: { increment: commission } } })
  for (const ln of lines) {
    await db.product.update({ where: { id: ln.productId }, data: { stock: { decrement: ln.qty } } })
  }

  return jsonResponse({ ok: true, order: { id: order.id, total: order.total, commission, status: order.status } })
}
