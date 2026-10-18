import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getAccountFromRequest, jsonResponse, errorResponse, rateLimit, getClientIp, sanitizeText, isName } from '@/lib/auth'
import { safeJson } from '@/lib/guards'

// GET — vendor's own products.
export async function GET(req: NextRequest) {
  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'vendor') return errorResponse('Vendor access required.', 403)
  const vendor = await db.vendorProfile.findUnique({ where: { accountId: account.id } })
  if (!vendor) return errorResponse('Vendor profile missing.', 404)
  const products = await db.product.findMany({ where: { vendorId: vendor.id }, orderBy: { createdAt: 'desc' } })
  return jsonResponse({ items: products })
}

// POST — create a product.
export async function POST(req: NextRequest) {
  const ip = getClientIp(req)
  const rl = rateLimit(`vprod:${ip}`, 10, 60_000)
  if (!rl.ok) return errorResponse('Slow down.', 429)

  const account = await getAccountFromRequest(req)
  if (!account || account.role !== 'vendor') return errorResponse('Vendor access required.', 403)
  const vendor = await db.vendorProfile.findUnique({ where: { accountId: account.id } })
  if (!vendor) return errorResponse('Vendor profile missing.', 404)

  const body = await safeJson(req)
  if (!body) return errorResponse('Invalid request.', 400)
  const name = sanitizeText(String(body.name || ''), 120)
  const description = sanitizeText(String(body.description || ''), 2000)
  if (!isName(name)) return errorResponse('Valid product name required.', 400)
  const price = Number(body.pricePerUnit)
  const moq = Math.max(1, Math.floor(Number(body.moq) || 1))
  const stock = Math.max(0, Math.floor(Number(body.stock) || 0))
  if (!Number.isFinite(price) || price <= 0) return errorResponse('Valid price required.', 400)
  const images = Array.isArray(body.images) ? body.images.filter((u) => typeof u === 'string').slice(0, 8).map((u) => sanitizeText(String(u), 500)) : []
  const specs = Array.isArray(body.specs) ? body.specs.filter((s) => s && typeof s === 'object').slice(0, 12).map((s) => ({ label: sanitizeText(String((s as Record<string, unknown>).label || ''), 40), value: sanitizeText(String((s as Record<string, unknown>).value || ''), 80) })) : []
  const bulkTiers = Array.isArray(body.bulkTiers) ? body.bulkTiers.filter((t) => t && typeof t === 'object').slice(0, 5).map((t) => ({ minQty: Math.max(1, Math.floor(Number((t as Record<string, unknown>).minQty) || 0)), pricePerUnit: Math.max(0, Number((t as Record<string, unknown>).pricePerUnit) || 0) })) : []
  const unit = sanitizeText(String(body.unit || 'piece'), 40)
  const categoryName = sanitizeText(String(body.categoryName || 'General'), 60)

  // find or create category by name
  let category = await db.category.findFirst({ where: { name: categoryName } })
  if (!category) {
    category = await db.category.create({ data: { name: categoryName, slug: categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-') } })
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.random().toString(36).slice(2, 6)
  const product = await db.product.create({
    data: {
      vendorId: vendor.id,
      name,
      slug,
      description,
      categoryId: category.id,
      categoryName: category.name,
      images: JSON.stringify(images),
      unit,
      moq,
      pricePerUnit: price,
      bulkTiers: JSON.stringify(bulkTiers),
      stock,
      specs: JSON.stringify(specs),
      rating: 0,
      featured: false,
      status: 'active',
    },
  })
  return jsonResponse({ ok: true, product })
}
