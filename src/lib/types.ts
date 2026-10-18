// Shared types used across the storefront.
export interface ProductPublic {
  id: string
  name: string
  slug: string
  description: string
  categoryName: string
  images: string[]
  unit: string
  moq: number
  pricePerUnit: number
  bulkTiers: { minQty: number; pricePerUnit: number }[]
  stock: number
  specs: { label: string; value: string }[]
  rating: number
  featured: boolean
  vendorBadge: boolean
  createdAt: string
}

export interface DealPublic {
  id: string
  title: string
  discountPct: number
  featured: boolean
  active: boolean
  product: ProductPublic
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
}

export interface Market {
  id: string
  name: string
  region: string
  description: string | null
  active: boolean
}
