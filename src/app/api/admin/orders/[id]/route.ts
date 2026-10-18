import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

// Admin can move an order to any valid status.
const VALID = ['placed', 'assigned', 'in_transit', 'delivered', 'cancelled']
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  const order = await db.order.findUnique({ where: { id } })
  if (!order) return errorResponse('Order not found.', 404)
  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const status = String(body.status || '').slice(0, 20)
  if (!VALID.includes(status)) return errorResponse('Invalid status.', 400)
  const updated = await db.order.update({ where: { id }, data: { status } })
  return jsonResponse({ ok: true, status: updated.status })
}
