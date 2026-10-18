import { getAccountFromRequest } from './auth'
import type { NextRequest } from 'next/server'
import { errorResponse } from './auth'

// Returns the authenticated account or null (does not throw).
export async function getAuth(req: NextRequest) {
  return getAccountFromRequest(req)
}

// Require any authenticated account.
export async function requireAuth(req: NextRequest) {
  const acc = await getAccountFromRequest(req)
  if (!acc) return { account: null, response: errorResponse('Authentication required.', 401) }
  return { account: acc, response: null }
}

// Require an account with one of the allowed roles.
export async function requireRole(req: NextRequest, roles: string[]) {
  const acc = await getAccountFromRequest(req)
  if (!acc) return { account: null, response: errorResponse('Authentication required.', 401) }
  if (!roles.includes(acc.role)) {
    return { account: null, response: errorResponse('Insufficient permissions.', 403) }
  }
  return { account: acc, response: null }
}

// Safe JSON parse with size limit to mitigate large-payload DoS.
export async function safeJson(req: NextRequest, maxBytes = 100_000): Promise<null | Record<string, unknown>> {
  try {
    const text = await req.text()
    if (text.length > maxBytes) return null
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    return null
  }
}
