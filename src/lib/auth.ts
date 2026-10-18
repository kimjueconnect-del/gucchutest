import { db } from './db'
import type { NextRequest } from 'next/server'

// ============================================================
// Password hashing — bcryptjs-free implementation using Web Crypto.
// We use PBKDF2 (SHA-256) with a per-user salt and high iterations.
// ============================================================

const ITERATIONS = 100_000
const KEY_LENGTH = 32

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function hexToBuf(hex: string): Uint8Array {
  const arr = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    arr[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return arr
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const saltHex = bufToHex(salt.buffer)
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH * 8
  )
  return `pbkdf2$${ITERATIONS}$${saltHex}$${bufToHex(derived)}`
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$')
  if (parts.length !== 4 || parts[0] !== 'pbkdf2') return false
  const iterations = parseInt(parts[1], 10)
  const salt = hexToBuf(parts[2])
  const expected = parts[3]
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    KEY_LENGTH * 8
  )
  // constant-time-ish comparison
  const actual = bufToHex(derived)
  if (actual.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < actual.length; i++) {
    diff |= actual.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}

// ============================================================
// JWT — stateless signed tokens (HS256) using Web Crypto HMAC.
// ============================================================

const JWT_SECRET = process.env.JWT_SECRET || 'gucchutest-dev-secret-change-in-prod-9f3a7c1e'
const JWT_ISSUER = 'gucchutest'
const JWT_EXPIRY_HOURS = 24 * 7

function base64UrlEncode(input: string | Uint8Array): string {
  const bytes = typeof input === 'string' ? new TextEncoder().encode(input) : input
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function base64UrlDecode(input: string): string {
  const pad = input.length % 4 === 0 ? '' : '='.repeat(4 - (input.length % 4))
  const b64 = input.replace(/-/g, '+').replace(/_/g, '/') + pad
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

async function hmacSign(data: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(JWT_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return base64UrlEncode(new Uint8Array(sig))
}

export async function signToken(payload: {
  sub: string
  role: string
  email: string
  name: string
}): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' }
  const now = Math.floor(Date.now() / 1000)
  const body = {
    ...payload,
    iss: JWT_ISSUER,
    iat: now,
    exp: now + JWT_EXPIRY_HOURS * 3600,
  }
  const encHeader = base64UrlEncode(JSON.stringify(header))
  const encBody = base64UrlEncode(JSON.stringify(body))
  const signingInput = `${encHeader}.${encBody}`
  const sig = await hmacSign(signingInput)
  return `${signingInput}.${sig}`
}

export async function verifyToken(token: string): Promise<null | {
  sub: string
  role: string
  email: string
  name: string
}> {
  const parts = token.split('.')
  if (parts.length !== 3) return null
  const signingInput = `${parts[0]}.${parts[1]}`
  const expectedSig = await hmacSign(signingInput)
  if (expectedSig !== parts[2]) return null
  try {
    const body = JSON.parse(base64UrlDecode(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    if (body.exp && body.exp < now) return null
    if (body.iss !== JWT_ISSUER) return null
    return { sub: body.sub, role: body.role, email: body.email, name: body.name }
  } catch {
    return null
  }
}

// ============================================================
// Cookie helpers
// ============================================================

const COOKIE_NAME = 'bc_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export function setSessionCookie(res: Response, token: string) {
  const secure = process.env.NODE_ENV === 'production'
  res.headers.append(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}${secure ? '; Secure' : ''}`
  )
}

export function clearSessionCookie(res: Response) {
  res.headers.append(
    'Set-Cookie',
    `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  )
}

export async function getAccountFromRequest(req: NextRequest) {
  const token = req.cookies.get(COOKIE_NAME)?.value
  if (!token) return null
  const payload = await verifyToken(token)
  if (!payload) return null
  const account = await db.account.findUnique({ where: { id: payload.sub } })
  if (!account || account.status !== 'active') return null
  return account
}

export function getTokenFromRequest(req: NextRequest): string | undefined {
  return req.cookies.get(COOKIE_NAME)?.value
}

export { COOKIE_NAME }

// ============================================================
// Input validation — strict allow-lists to stop injection.
// ============================================================

const EMAIL_RE = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const NAME_RE = /^[a-zA-Z0-9 .,'&-]{2,80}$/
const PHONE_RE = /^[+]?[0-9 ]{7,18}$/
const SAFE_TEXT_RE = /^[a-zA-Z0-9 .,:'"&#()@/-]{0,500}$/

export function isEmail(v: string): boolean {
  return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v)
}

export function isName(v: string): boolean {
  return typeof v === 'string' && v.length >= 2 && v.length <= 80 && NAME_RE.test(v)
}

export function isPhone(v: string): boolean {
  return typeof v === 'string' && PHONE_RE.test(v)
}

export function isSafeText(v: string, max = 500): boolean {
  return typeof v === 'string' && v.length <= max && SAFE_TEXT_RE.test(v)
}

// Strip any HTML/script-like content for free-form fields.
export function sanitizeText(v: string, max = 2000): string {
  if (typeof v !== 'string') return ''
  let s = v.slice(0, max)
  s = s.replace(/<[^>]*>/g, '') // remove tags
  s = s.replace(/javascript:/gi, '')
  s = s.replace(/on\w+\s*=/gi, '')
  return s
}

// Password policy: min 8 chars, upper, lower, digit, symbol.
export function isStrongPassword(v: string): { ok: boolean; reason?: string } {
  if (typeof v !== 'string' || v.length < 8) return { ok: false, reason: 'Password must be at least 8 characters.' }
  if (v.length > 128) return { ok: false, reason: 'Password too long.' }
  if (!/[a-z]/.test(v)) return { ok: false, reason: 'Include a lowercase letter.' }
  if (!/[A-Z]/.test(v)) return { ok: false, reason: 'Include an uppercase letter.' }
  if (!/[0-9]/.test(v)) return { ok: false, reason: 'Include a digit.' }
  if (!/[^a-zA-Z0-9]/.test(v)) return { ok: false, reason: 'Include a symbol.' }
  // block common weak passwords
  const weak = ['password', '12345678', 'qwerty12', 'pass1234']
  if (weak.some((w) => v.toLowerCase().includes(w))) {
    return { ok: false, reason: 'Password is too common.' }
  }
  return { ok: true }
}

export function isValidRole(v: string): boolean {
  return ['buyer', 'vendor', 'transport', 'sales', 'admin'].includes(v)
}

// ============================================================
// Rate limiting — in-memory sliding window per IP+endpoint.
// Mitigates brute-force & DDoS-style floods.
// ============================================================

interface RateBucket {
  count: number
  resetAt: number
}
const rateMap = new Map<string, RateBucket>()

// Periodically purge stale buckets to bound memory.
let lastPurge = Date.now()
function purge() {
  const now = Date.now()
  if (now - lastPurge < 60_000) return
  lastPurge = now
  for (const [k, v] of rateMap) {
    if (v.resetAt < now) rateMap.delete(k)
  }
}

export function rateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { ok: boolean; retryAfterMs: number } {
  purge()
  const now = Date.now()
  const bucket = rateMap.get(key)
  if (!bucket || bucket.resetAt < now) {
    rateMap.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterMs: 0 }
  }
  bucket.count++
  if (bucket.count > maxRequests) {
    return { ok: false, retryAfterMs: bucket.resetAt - now }
  }
  return { ok: true, retryAfterMs: 0 }
}

export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

// ============================================================
// JSON response helper with security headers.
// ============================================================

export function jsonResponse(
  body: unknown,
  opts: { status?: number; res?: Response; headers?: Record<string, string> } = {}
): Response {
  const status = opts.status ?? 200
  const res = new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'no-store',
      ...(opts.headers || {}),
    },
  })
  if (opts.res) {
    // copy headers onto an existing response if provided (for cookies)
  }
  return res
}

export function errorResponse(message: string, status = 400, extra: Record<string, unknown> = {}) {
  return jsonResponse({ error: message, ...extra }, { status })
}
