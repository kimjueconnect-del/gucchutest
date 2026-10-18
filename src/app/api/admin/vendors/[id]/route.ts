import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

// Update a vendor profile (exclusive, verified) and/or its account status.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  const vendor = await db.vendorProfile.findUnique({ where: { id } })
  if (!vendor) return errorResponse('Vendor not found.', 404)
  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)

  const data: Record<string, unknown> = {}
  if (body.exclusive !== undefined) data.exclusive = !!body.exclusive
  if (body.verified !== undefined) data.verified = !!body.verified
  if (body.rating !== undefined) { const r = Number(body.rating); if (r >= 0 && r <= 5) data.rating = r }
  await db.vendorProfile.update({ where: { id }, data })

  if (body.status !== undefined && ['active', 'suspended', 'pending'].includes(String(body.status))) {
    await db.account.update({ where: { id: vendor.accountId }, data: { status: String(body.status) } })
  }
  return jsonResponse({ ok: true })
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const { id } = await params
  const vendor = await db.vendorProfile.findUnique({ where: { id } })
  if (!vendor) return errorResponse('Vendor not found.', 404)
  // cascade delete account + products
  await db.account.delete({ where: { id: vendor.accountId } })
  return jsonResponse({ ok: true })
}
