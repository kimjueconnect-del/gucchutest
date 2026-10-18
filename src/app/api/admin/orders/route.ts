import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const orders = await db.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: {
      buyer: { select: { name: true, email: true, phone: true } },
      transport: { select: { companyName: true } },
      salesPerson: { select: { region: true, account: { select: { name: true } } } },
    },
  })
  return jsonResponse({
    items: orders.map((o) => ({
      id: o.id,
      status: o.status,
      subtotal: o.subtotal,
      transportFee: o.transportFee,
      total: o.total,
      salesCommission: o.salesCommission,
      items: JSON.parse(o.items),
      deliveryAddress: JSON.parse(o.deliveryAddress),
      buyer: o.buyer,
      transport: o.transport?.companyName || null,
      salesPerson: o.salesPerson?.account?.name || null,
      createdAt: o.createdAt,
    })),
  })
}
