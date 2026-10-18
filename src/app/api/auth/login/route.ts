import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  verifyPassword,
  signToken,
  setSessionCookie,
  isEmail,
  rateLimit,
  getClientIp,
  jsonResponse,
  errorResponse,
} from '@/lib/auth'
import { safeJson } from '@/lib/guards'

export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`login:${ip}`, 8, 60_000)
  if (!rl.ok) return errorResponse('Too many login attempts. Please wait a minute.', 429)

  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  if (body.website) return errorResponse('Invalid request.', 400) // honeypot
  if (!isEmail(email)) return errorResponse('Invalid email or password.', 400)

  const account = await db.account.findUnique({ where: { email } })
  // Always run a verification to keep timing roughly constant (mitigate user enumeration).
  const dummyHash = '$pbkdf2$100000$00000000000000000000000000000000$0000000000000000000000000000000000000000000000000000000000000000'
  const ok = account ? await verifyPassword(password, account.passwordHash) : await verifyPassword(password, dummyHash)

  if (!account || !ok) return errorResponse('Invalid email or password.', 401)
  if (account.status !== 'active') return errorResponse('This account has been suspended. Contact support.', 403)

  const token = await signToken({ sub: account.id, role: account.role, email: account.email, name: account.name })
  const res = jsonResponse({ ok: true, account: { id: account.id, email: account.email, role: account.role, name: account.name, phone: account.phone } })
  setSessionCookie(res, token)
  await db.auditLog.create({ data: { accountId: account.id, action: 'login', ip, detail: 'success' } })
  return res
}
