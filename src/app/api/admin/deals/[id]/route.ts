import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse, sanitizeText, isName } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  const deal = await db.deal.findUnique({ where: { id } })
  if (!deal) return errorResponse('Deal not found.', 404)
  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const data: Record<string, unknown> = {}
  if (body.title !== undefined) { const t = sanitizeText(String(body.title), 100); if (isName(t)) data.title = t }
  if (body.discountPct !== undefined) { const d = Number(body.discountPct); if (d > 0 && d <= 90) data.discountPct = d }
  if (body.active !== undefined) data.active = !!body.active
  if (body.featured !== undefined) data.featured = !!body.featured
  const updated = await db.deal.update({ where: { id }, data })
  return jsonResponse({ ok: true, deal: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  await db.deal.delete({ where: { id } })
  return jsonResponse({ ok: true })
}
