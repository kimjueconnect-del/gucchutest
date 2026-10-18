import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse } from '@/lib/auth'

// GET all vendors (admin view).
export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const vendors = await db.vendorProfile.findMany({
    include: { account: { select: { email: true, name: true, phone: true, status: true } } },
    orderBy: { createdAt: 'desc' },
  })
  return jsonResponse({ items: vendors })
}
