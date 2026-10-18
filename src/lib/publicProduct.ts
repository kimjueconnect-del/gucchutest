import { db } from '@/lib/db'

// Serialise a product for the PUBLIC storefront. Vendor & transport details
// are intentionally stripped so buyers never see supplier information.
export function publicProduct(p: {
  id: string
  name: string
  slug: string
  description: string
  categoryName: string
  images: string
  unit: string
  moq: number
  pricePerUnit: number
  bulkTiers: string
  stock: number
  specs: string
  rating: number
  featured: boolean
  createdAt: Date
}) {
  let images: string[] = []
  let bulkTiers: { minQty: number; pricePerUnit: number }[] = []
  let specs: { label: string; value: string }[] = []
  try { images = JSON.parse(p.images) } catch { images = [] }
  try { bulkTiers = JSON.parse(p.bulkTiers) } catch { bulkTiers = [] }
  try { specs = JSON.parse(p.specs) } catch { specs = [] }
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    categoryName: p.categoryName,
    images,
    unit: p.unit,
    moq: p.moq,
    pricePerUnit: p.pricePerUnit,
    bulkTiers,
    stock: p.stock,
    specs,
    rating: p.rating,
    featured: p.featured,
    // vendor badge only — no name/contact
    vendorBadge: true,
    createdAt: p.createdAt,
  }
}
