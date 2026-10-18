import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  const tp = await db.transportProfile.findUnique({ where: { id } })
  if (!tp) return errorResponse('Transport not found.', 404)
  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const data: Record<string, unknown> = {}
  if (body.exclusive !== undefined) data.exclusive = !!body.exclusive
  if (body.verified !== undefined) data.verified = !!body.verified
  if (body.baseRate !== undefined) { const r = Number(body.baseRate); if (r >= 0) data.baseRate = r }
  await db.transportProfile.update({ where: { id }, data })
  if (body.status !== undefined && ['active', 'suspended', 'pending'].includes(String(body.status))) {
    await db.account.update({ where: { id: tp.accountId }, data: { status: String(body.status) } })
  }
  return jsonResponse({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  const tp = await db.transportProfile.findUnique({ where: { id } })
  if (!tp) return errorResponse('Transport not found.', 404)
  await db.account.delete({ where: { id: tp.accountId } })
  return jsonResponse({ ok: true })
}
