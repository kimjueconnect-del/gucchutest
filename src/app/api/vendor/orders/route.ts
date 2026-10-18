import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse } from '@/lib/auth'

// Orders that contain this vendor's products. We scan order items JSON for
// matching product IDs (SQLite has no native JSON query — we filter in JS).
export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'vendor') return errorResponse('Vendor access required.', 403)
  const vendor = await db.vendorProfile.findUnique({ where: { accountId: account.id } })
  if (!vendor) return errorResponse('Vendor profile missing.', 404)

  const myProducts = await db.product.findMany({ where: { vendorId: vendor.id }, select: { id: true, name: true } })
  const myIds = new Set(myProducts.map((p) => p.id))

  const orders = await db.order.findMany({ orderBy: { createdAt: 'desc' }, take: 100 })
  const relevant = orders
    .map((o) => {
      let items: { productId: string; name: string; qty: number; pricePerUnit: number; lineTotal: number; unit: string }[] = []
      try { items = JSON.parse(o.items) } catch { items = [] }
      const mine = items.filter((i) => myIds.has(i.productId))
      if (mine.length === 0) return null
      return {
        id: o.id,
        status: o.status,
        total: mine.reduce((s, i) => s + i.lineTotal, 0),
        items: mine,
        deliveryAddress: JSON.parse(o.deliveryAddress),
        createdAt: o.createdAt,
      }
    })
    .filter(Boolean)

  return jsonResponse({ items: relevant })
}
