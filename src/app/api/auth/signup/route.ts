import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import {
  hashPassword,
  signToken,
  setSessionCookie,
  isEmail,
  isName,
  isPhone,
  isStrongPassword,
  isValidRole,
  rateLimit,
  getClientIp,
  jsonResponse,
  errorResponse,
  sanitizeText,
} from '@/lib/auth'
import { safeJson } from '@/lib/guards'

// Signup for any role. Vendors / transport / sales get a "pending" verification
// state by default; admin can verify later. Buyers are active immediately.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`signup:${ip}`, 6, 60_000)
  if (!rl.ok) return errorResponse('Too many attempts. Please wait a moment.', 429)

  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)

  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')
  const name = String(body.name || '').trim()
  const role = String(body.role || 'buyer')
  const phone = body.phone ? String(body.phone).trim() : ''
  if (body.website) return errorResponse('Invalid request.', 400) // honeypot

  if (!isEmail(email)) return errorResponse('A valid email is required.', 400)
  if (!isName(name)) return errorResponse('A valid name is required (2–80 chars, letters/numbers/spaces).', 400)
  if (!isValidRole(role) || role === 'admin') return errorResponse('Invalid account type.', 400)
  if (phone && !isPhone(phone)) return errorResponse('Invalid phone number.', 400)
  const pw = isStrongPassword(password)
  if (!pw.ok) return errorResponse(pw.reason || 'Password is too weak.', 400)

  const existing = await db.account.findUnique({ where: { email } })
  if (existing) return errorResponse('An account with this email already exists.', 409)

  const passwordHash = await hashPassword(password)
  const account = await db.account.create({
    data: { email, passwordHash, role, name, phone: phone || null, status: 'active' },
  })

  if (role === 'vendor') {
    const businessName = String(body.businessName || '').trim()
    const gstin = body.gstin ? String(body.gstin).trim() : ''
    const market = String(body.market || 'Delhi').trim()
    if (!isName(businessName)) return errorResponse('Valid business name required.', 400)
    await db.vendorProfile.create({
      data: {
        accountId: account.id,
        businessName,
        gstin: gstin.slice(0, 20) || null,
        market: sanitizeText(market, 60),
        exclusive: false,
        verified: false,
        rating: 0,
      },
    })
  } else if (role === 'transport') {
    const companyName = String(body.companyName || '').trim()
    if (!isName(companyName)) return errorResponse('Valid company name required.', 400)
    const vehicles = Array.isArray(body.vehicleTypes) ? body.vehicleTypes : []
    const coverage = Array.isArray(body.coverageAreas) ? body.coverageAreas : []
    await db.transportProfile.create({
      data: {
        accountId: account.id,
        companyName,
        vehicleTypes: JSON.stringify(vehicles.filter((v) => typeof v === 'string').slice(0, 10).map((v) => sanitizeText(String(v), 40))),
        coverageAreas: JSON.stringify(coverage.filter((v) => typeof v === 'string').slice(0, 10).map((v) => sanitizeText(String(v), 40))),
        exclusive: false,
        verified: false,
        baseRate: Number(body.baseRate) || 0,
      },
    })
  } else if (role === 'sales') {
    const region = String(body.region || 'Delhi NCR').trim()
    await db.salesProfile.create({
      data: { accountId: account.id, region: sanitizeText(region, 60), commissionPct: 5, status: 'active' },
    })
  }

  const token = await signToken({ sub: account.id, role: account.role, email: account.email, name: account.name })
  const res = jsonResponse({ ok: true, account: { id: account.id, email: account.email, role: account.role, name: account.name } })
  setSessionCookie(res, token)
  return res
}
