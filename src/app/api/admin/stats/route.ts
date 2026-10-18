import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse } from '@/lib/auth'

// Admin dashboard stats.
export async function GET(req: Request) {
  const account = await getAccountFromRequest(req as unknown as import('next/server').NextRequest)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)

  const [
    products, vendors, transport, sales, orders, deals, buyers, revenueAgg,
  ] = await Promise.all([
    db.product.count(),
    db.vendorProfile.count(),
    db.transportProfile.count(),
    db.salesProfile.count(),
    db.order.count(),
    db.deal.count(),
    db.account.count({ where: { role: 'buyer' } }),
    db.order.aggregate({ _sum: { total: true } }),
  ])

  const ordersByStatus = await db.order.groupBy({ by: ['status'], _count: true })
  const statusMap: Record<string, number> = {}
  for (const s of ordersByStatus) statusMap[s.status] = s._count

  return jsonResponse({
    products, vendors, transport, sales, orders, deals, buyers,
    revenue: revenueAgg._sum.total || 0,
    ordersByStatus: statusMap,
  })
}
