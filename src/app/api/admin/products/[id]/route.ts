import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse, sanitizeText, isName } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  const product = await db.product.findUnique({ where: { id } })
  if (!product) return errorResponse('Product not found.', 404)
  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)

  const data: Record<string, unknown> = {}
  if (body.name !== undefined) { const n = sanitizeText(String(body.name), 120); if (isName(n)) data.name = n }
  if (body.description !== undefined) data.description = sanitizeText(String(body.description), 2000)
  if (body.pricePerUnit !== undefined) { const p = Number(body.pricePerUnit); if (p > 0) data.pricePerUnit = p }
  if (body.moq !== undefined) data.moq = Math.max(1, Math.floor(Number(body.moq) || 1))
  if (body.stock !== undefined) data.stock = Math.max(0, Math.floor(Number(body.stock) || 0))
  if (body.images !== undefined) data.images = JSON.stringify((body.images as unknown[]).filter((u) => typeof u === 'string').slice(0, 8).map((u) => sanitizeText(String(u), 500)))
  if (body.specs !== undefined) data.specs = JSON.stringify((body.specs as Record<string, unknown>[]).slice(0, 12).map((s) => ({ label: sanitizeText(String(s.label || ''), 40), value: sanitizeText(String(s.value || ''), 80) })))
  if (body.bulkTiers !== undefined) data.bulkTiers = JSON.stringify((body.bulkTiers as Record<string, unknown>[]).slice(0, 5).map((t) => ({ minQty: Math.max(1, Math.floor(Number(t.minQty) || 0)), pricePerUnit: Math.max(0, Number(t.pricePerUnit) || 0) })))
  if (body.status !== undefined) data.status = ['active', 'draft', 'blocked'].includes(String(body.status)) ? String(body.status) : 'active'
  if (body.featured !== undefined) data.featured = !!body.featured

  const updated = await db.product.update({ where: { id }, data })
  return jsonResponse({ ok: true, product: updated })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  await db.product.delete({ where: { id } })
  return jsonResponse({ ok: true })
}
