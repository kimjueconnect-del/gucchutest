import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse, rateLimit, getClientIp } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

const STATUS_FLOW: Record<string, string[]> = {
  assigned: ['in_transit'],
  in_transit: ['delivered', 'cancelled'],
  placed: ['assigned', 'cancelled'],
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account) return errorResponse('Login required.', 401)
  const { id } = await params
  const order = await db.order.findUnique({ where: { id } })
  if (!order) return errorResponse('Order not found.', 404)

  // access control
  const isOwner = order.buyerId === account.id
  const isAdmin = account.role === 'admin'
  if (!isOwner && !isAdmin) return errorResponse('Not allowed.', 403)

  return jsonResponse({
    order: {
      id: order.id,
      items: JSON.parse(order.items),
      subtotal: order.subtotal,
      transportFee: order.transportFee,
      total: order.total,
      status: order.status,
      deliveryAddress: JSON.parse(order.deliveryAddress),
      createdAt: order.createdAt,
    },
  })
}

// PUT — update order status (transport or admin only, on their own assigned orders).
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = getClientIp(req)
  const rl = rateLimit(`orderupdate:${ip}`, 20, 60_000)
  if (!rl.ok) return errorResponse('Too many updates.', 429)

  const account = await getAccountFromRequest(req)
  if (!account) return errorResponse('Login required.', 401)
  const { id } = await params
  const order = await db.order.findUnique({ where: { id } })
  if (!order) return errorResponse('Order not found.', 404)

  let allowed = false
  if (account.role === 'admin') allowed = true
  if (account.role === 'transport') {
    const tp = await db.transportProfile.findUnique({ where: { accountId: account.id } })
    if (tp && order.transportId === tp.id) allowed = true
  }
  if (!allowed) return errorResponse('Not allowed to update this order.', 403)

  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const nextStatus = String(body.status || '').slice(0, 20)
  const allowedNext = STATUS_FLOW[order.status] || []
  if (!allowedNext.includes(nextStatus)) {
    return errorResponse(`Cannot move from "${order.status}" to "${nextStatus}".`, 400)
  }

  const updated = await db.order.update({ where: { id }, data: { status: nextStatus } })
  return jsonResponse({ ok: true, status: updated.status })
}
