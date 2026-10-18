import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse, sanitizeText, isName } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

// GET all products (admin view, includes vendor).
export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' },
    include: { vendor: { select: { businessName: true, exclusive: true } } },
    take: 200,
  })
  return jsonResponse({ items: products })
}

// POST — admin creates a product on behalf of any vendor.
export async function POST(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'admin') return errorResponse('Admin access required.', 403)
  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const name = sanitizeText(String(body.name || ''), 120)
  const description = sanitizeText(String(body.description || ''), 2000)
  if (!isName(name)) return errorResponse('Valid product name required.', 400)
  const vendorId = String(body.vendorId || '')
  const vendor = await db.vendorProfile.findUnique({ where: { id: vendorId } })
  if (!vendor) return errorResponse('Vendor not found.', 404)
  const price = Number(body.pricePerUnit)
  const moq = Math.max(1, Math.floor(Number(body.moq) || 1))
  const stock = Math.max(0, Math.floor(Number(body.stock) || 0))
  if (!Number.isFinite(price) || price <= 0) return errorResponse('Valid price required.', 400)
  const images = Array.isArray(body.images) ? body.images.filter((u) => typeof u === 'string').slice(0, 8).map((u) => sanitizeText(String(u), 500)) : []
  const specs = Array.isArray(body.specs) ? body.specs.slice(0, 12).map((s) => ({ label: sanitizeText(String((s as Record<string, unknown>).label || ''), 40), value: sanitizeText(String((s as Record<string, unknown>).value || ''), 80) })) : []
  const bulkTiers = Array.isArray(body.bulkTiers) ? body.bulkTiers.slice(0, 5).map((t) => ({ minQty: Math.max(1, Math.floor(Number((t as Record<string, unknown>).minQty) || 0)), pricePerUnit: Math.max(0, Number((t as Record<string, unknown>).pricePerUnit) || 0) })) : []
  const unit = sanitizeText(String(body.unit || 'piece'), 40)
  const categoryName = sanitizeText(String(body.categoryName || 'General'), 60)
  let category = await db.category.findFirst({ where: { name: categoryName } })
  if (!category) category = await db.category.create({ data: { name: categoryName, slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') } })

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 6)
  const product = await db.product.create({
    data: {
      vendorId, name, slug, description, categoryId: category.id, categoryName: category.name,
      images: JSON.stringify(images), unit, moq, pricePerUnit: price, bulkTiers: JSON.stringify(bulkTiers),
      stock, specs: JSON.stringify(specs), rating: 0, featured: !!body.featured, status: 'active',
    },
  })
  return jsonResponse({ ok: true, product })
}
