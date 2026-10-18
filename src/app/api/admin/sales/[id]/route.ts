import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse, sanitizeText } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  const sp = await db.salesProfile.findUnique({ where: { id } })
  if (!sp) return errorResponse('Sales person not found.', 404)
  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const data: Record<string, unknown> = {}
  if (body.commissionPct !== undefined) { const c = Number(body.commissionPct); if (c >= 0 && c <= 50) data.commissionPct = c }
  if (body.region !== undefined) data.region = sanitizeText(String(body.region), 60)
  if (body.status !== undefined && ['active', 'inactive'].includes(String(body.status))) data.status = String(body.status)
  await db.salesProfile.update({ where: { id }, data })
  if (body.accountStatus !== undefined && ['active', 'suspended', 'pending'].includes(String(body.accountStatus))) {
    await db.account.update({ where: { id: sp.accountId }, data: { status: String(body.accountStatus) } })
  }
  return jsonResponse({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  const sp = await db.salesProfile.findUnique({ where: { id } })
  if (!sp) return errorResponse('Sales person not found.', 404)
  await db.account.delete({ where: { id: sp.accountId } })
  return jsonResponse({ ok: true })
}
