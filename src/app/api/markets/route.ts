import { db } from '@/lib/db'
import { jsonResponse } from '@/lib/auth'

export async function GET() {
  const markets = await db.market.findMany({ orderBy: { active: 'desc' } })
  return jsonResponse({ items: markets })
}
