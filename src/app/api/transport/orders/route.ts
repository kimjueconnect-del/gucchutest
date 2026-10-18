import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse } from '@/lib/auth'

// Orders assigned to this transport company.
export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'transport') return errorResponse('Transport access required.', 403)
  const tp = await db.transportProfile.findUnique({ where: { accountId: account.id } })
  if (!tp) return errorResponse('Transport profile missing.', 404)

  const orders = await db.order.findMany({
    where: { transportId: tp.id },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  return jsonResponse({
    items: orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: o.total,
      transportFee: o.transportFee,
      items: JSON.parse(o.items),
      deliveryAddress: JSON.parse(o.deliveryAddress),
      createdAt: o.createdAt,
    })),
  })
}
