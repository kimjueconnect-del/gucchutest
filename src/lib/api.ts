// Typed API client for the storefront. All calls use relative paths so the
// gateway can route them correctly.
import type { ProductPublic, DealPublic, Category, Market } from './types'

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
    credentials: 'same-origin',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`
    const err = new Error(msg) as Error & { status: number }
    err.status = res.status
    throw err
  }
  return data as T
}

export const apiClient = {
  // ---- public catalog ----
  products: (params: Record<string, string | number | undefined> = {}) => {
    const q = new URLSearchParams()
    for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== '') q.set(k, String(v))
    return api<{ items: ProductPublic[]; total: number; page: number; pages: number; limit: number }>(`/api/products?${q.toString()}`)
  },
  product: (id: string) => api<ProductPublic & { reviews: { id: string; rating: number; comment: string; createdAt: string; buyerName: string }[] }>(`/api/products/${id}`),
  deals: (featured?: boolean) => api<{ items: DealPublic[] }>(`/api/deals${featured ? '?featured=1' : ''}`),
  categories: () => api<{ items: Category[] }>('/api/categories'),
  markets: () => api<{ items: Market[] }>('/api/markets'),

  // ---- auth ----
  signup: (body: Record<string, unknown>) => api<{ ok: boolean; account: { id: string; email: string; role: string; name: string } }>('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) => api<{ ok: boolean; account: { id: string; email: string; role: string; name: string; phone?: string } }>('/api/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => api<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
  me: () => api<{ account: { id: string; email: string; role: string; name: string; phone?: string } | null; profile: unknown }>('/api/auth/me'),

  // ---- reviews ----
  addReview: (productId: string, rating: number, comment: string) => api<{ ok: boolean; review: unknown }>(`/api/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify({ rating, comment }) }),

  // ---- orders ----
  placeOrder: (body: { items: { productId: string; qty: number }[]; deliveryAddress: Record<string, string> }) => api<{ ok: boolean; order: { id: string; total: number; status: string; transportAssigned: boolean } }>('/api/orders', { method: 'POST', body: JSON.stringify(body) }),
  myOrders: () => api<{ items: OrderRow[] }>('/api/orders'),

  // ---- vendor ----
  vendorProducts: () => api<{ items: VendorProductRow[] }>('/api/vendor/products'),
  vendorCreateProduct: (body: Record<string, unknown>) => api<{ ok: boolean; product: VendorProductRow }>('/api/vendor/products', { method: 'POST', body: JSON.stringify(body) }),
  vendorUpdateProduct: (id: string, body: Record<string, unknown>) => api<{ ok: boolean; product: VendorProductRow }>(`/api/vendor/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  vendorDeleteProduct: (id: string) => api<{ ok: boolean }>(`/api/vendor/products/${id}`, { method: 'DELETE' }),
  vendorOrders: () => api<{ items: VendorOrderRow[] }>('/api/vendor/orders'),

  // ---- transport ----
  transportOrders: () => api<{ items: TransportOrderRow[] }>('/api/transport/orders'),

  // ---- sales ----
  salesOrders: () => api<{ items: SalesOrderRow[] }>('/api/sales/orders'),
  salesCreateOrder: (body: { items: { productId: string; qty: number }[]; deliveryAddress: Record<string, string> }) => api<{ ok: boolean; order: { id: string; total: number; commission: number; status: string } }>('/api/sales/orders', { method: 'POST', body: JSON.stringify(body) }),

  // ---- admin ----
  adminStats: () => api<AdminStats>('/api/admin/stats'),
  adminProducts: () => api<{ items: AdminProductRow[] }>('/api/admin/products'),
  adminCreateProduct: (body: Record<string, unknown>) => api<{ ok: boolean; product: AdminProductRow }>('/api/admin/products', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateProduct: (id: string, body: Record<string, unknown>) => api<{ ok: boolean }>(`/api/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteProduct: (id: string) => api<{ ok: boolean }>(`/api/admin/products/${id}`, { method: 'DELETE' }),
  adminVendors: () => api<{ items: AdminVendorRow[] }>('/api/admin/vendors'),
  adminUpdateVendor: (id: string, body: Record<string, unknown>) => api<{ ok: boolean }>(`/api/admin/vendors/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteVendor: (id: string) => api<{ ok: boolean }>(`/api/admin/vendors/${id}`, { method: 'DELETE' }),
  adminTransport: () => api<{ items: AdminTransportRow[] }>('/api/admin/transport'),
  adminUpdateTransport: (id: string, body: Record<string, unknown>) => api<{ ok: boolean }>(`/api/admin/transport/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteTransport: (id: string) => api<{ ok: boolean }>(`/api/admin/transport/${id}`, { method: 'DELETE' }),
  adminSales: () => api<{ items: AdminSalesRow[] }>('/api/admin/sales'),
  adminUpdateSales: (id: string, body: Record<string, unknown>) => api<{ ok: boolean }>(`/api/admin/sales/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteSales: (id: string) => api<{ ok: boolean }>(`/api/admin/sales/${id}`, { method: 'DELETE' }),
  adminDeals: () => api<{ items: AdminDealRow[] }>('/api/admin/deals'),
  adminCreateDeal: (body: Record<string, unknown>) => api<{ ok: boolean }>('/api/admin/deals', { method: 'POST', body: JSON.stringify(body) }),
  adminUpdateDeal: (id: string, body: Record<string, unknown>) => api<{ ok: boolean }>(`/api/admin/deals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  adminDeleteDeal: (id: string) => api<{ ok: boolean }>(`/api/admin/deals/${id}`, { method: 'DELETE' }),
  adminOrders: () => api<{ items: AdminOrderRow[] }>('/api/admin/orders'),
  adminUpdateOrder: (id: string, status: string) => api<{ ok: boolean }>(`/api/admin/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
}

export type {
  ProductPublic, DealPublic, Category, Market,
}

export interface OrderRow {
  id: string
  items: { productId: string; name: string; unit: string; qty: number; pricePerUnit: number; lineTotal: number; image: string }[]
  subtotal: number
  transportFee: number
  total: number
  status: string
  deliveryAddress: Record<string, string>
  createdAt: string
}
export interface VendorProductRow {
  id: string; name: string; slug: string; description: string; categoryName: string; images: string;
  unit: string; moq: number; pricePerUnit: number; bulkTiers: string; stock: number; specs: string;
  rating: number; featured: boolean; status: string; createdAt: string
}
export interface VendorOrderRow {
  id: string; status: string; total: number;
  items: { productId: string; name: string; qty: number; pricePerUnit: number; lineTotal: number; unit: string }[];
  deliveryAddress: Record<string, string>; createdAt: string
}
export interface TransportOrderRow {
  id: string; status: string; total: number; transportFee: number;
  items: { name: string; qty: number }[]; deliveryAddress: Record<string, string>; createdAt: string
}
export interface SalesOrderRow {
  id: string; status: string; total: number; salesCommission: number;
  items: { name: string; qty: number }[]; deliveryAddress: Record<string, string>; createdAt: string
}
export interface AdminStats {
  products: number; vendors: number; transport: number; sales: number; orders: number; deals: number; buyers: number; revenue: number; ordersByStatus: Record<string, number>
}
export interface AdminProductRow {
  id: string; name: string; pricePerUnit: number; stock: number; status: string; featured: boolean; categoryName: string;
  vendor: { businessName: string; exclusive: boolean }; createdAt: string
}
export interface AdminVendorRow {
  id: string; businessName: string; market: string; exclusive: boolean; verified: boolean; rating: number;
  account: { email: string; name: string; phone: string | null; status: string }; createdAt: string
}
export interface AdminTransportRow {
  id: string; companyName: string; exclusive: boolean; verified: boolean; rating: number; baseRate: number;
  vehicleTypes: string; coverageAreas: string;
  account: { email: string; name: string; phone: string | null; status: string }; createdAt: string
}
export interface AdminSalesRow {
  id: string; region: string; commissionPct: number; totalEarned: number; status: string;
  account: { email: string; name: string; phone: string | null; status: string }; createdAt: string
}
export interface AdminDealRow {
  id: string; title: string; discountPct: number; active: boolean; featured: boolean; productId: string;
  product: { name: string; id: string } | null; createdAt: string
}
export interface AdminOrderRow {
  id: string; status: string; subtotal: number; transportFee: number; total: number; salesCommission: number;
  items: { name: string; qty: number; lineTotal: number }[];
  buyer: { name: string; email: string; phone: string | null };
  transport: string | null; salesPerson: string | null;
  deliveryAddress: Record<string, string>; createdAt: string
}
