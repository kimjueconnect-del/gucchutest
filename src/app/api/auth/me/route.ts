import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse } from '@/lib/auth'

export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account) return errorResponse('Not authenticated.', 401)

  let profile: unknown = null
  if (account.role === 'vendor') {
    profile = await db.vendorProfile.findUnique({ where: { accountId: account.id } })
  } else if (account.role === 'transport') {
    profile = await db.transportProfile.findUnique({ where: { accountId: account.id } })
  } else if (account.role === 'sales') {
    profile = await db.salesProfile.findUnique({ where: { accountId: account.id } })
  }

  return jsonResponse({
    account: { id: account.id, email: account.email, role: account.role, name: account.name, phone: account.phone },
    profile,
  })
}
