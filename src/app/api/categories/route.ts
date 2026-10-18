import { db } from '@/lib/db'
import { jsonResponse } from '@/lib/auth'

export async function GET() {
  const cats = await db.category.findMany({ orderBy: { name: 'asc' } })
  return jsonResponse({ items: cats })
}
