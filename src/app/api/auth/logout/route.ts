import { NextRequest } from 'next/server'
import { clearSessionCookie, jsonResponse } from '@/lib/auth'

export async function POST(_req: NextRequest) {
  const res = jsonResponse({ ok: true })
  clearSessionCookie(res)
  return res
}
