'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================
// Navigation — SPA view router (single-route constraint).
// ============================================================
export type View =
  | { name: 'home' }
  | { name: 'product'; productId: string }
  | { name: 'cart' }
  | { name: 'wishlist' }
  | { name: 'checkout' }
  | { name: 'deals' }
  | { name: 'markets' }
  | { name: 'about' }
  | { name: 'orders' }
  | { name: 'login' }
  | { name: 'signup' }
  | { name: 'vendor' }
  | { name: 'transport' }
  | { name: 'sales' }
  | { name: 'admin' }
  | { name: 'legal'; doc: 'terms' | 'privacy' | 'ip' }

interface NavState {
  view: View
  history: View[]
  navigate: (view: View) => void
  back: () => void
  home: () => void
}

export const useNavStore = create<NavState>((set, get) => ({
  view: { name: 'home' },
  history: [],
  navigate: (view) => {
    set((s) => ({ view, history: [...s.history, s.view] }))
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' })
  },
  back: () => {
    const h = [...get().history]
    if (h.length === 0) {
      set({ view: { name: 'home' }, history: [] })
      return
    }
    const prev = h.pop()!
    set({ view: prev, history: h })
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'auto' })
  },
  home: () => set({ view: { name: 'home' }, history: [] }),
}))

// ============================================================
// Auth — hydrated from /api/auth/me on mount.
// ============================================================
export interface AuthAccount {
  id: string
  email: string
  role: string
  name: string
  phone?: string | null
}
interface AuthState {
  account: AuthAccount | null
  profile: unknown
  hydrated: boolean
  setAuth: (account: AuthAccount | null, profile?: unknown) => void
  setHydrated: (v: boolean) => void
}
export const useAuthStore = create<AuthState>((set) => ({
  account: null,
  profile: null,
  hydrated: false,
  setAuth: (account, profile) => set({ account, profile }),
  setHydrated: (v) => set({ hydrated: v }),
}))

// ============================================================
// Cart — persisted to localStorage so it survives refresh.
// ============================================================
export interface CartItem {
  productId: string
  name: string
  image: string
  unit: string
  qty: number
  pricePerUnit: number
  moq: number
}
interface CartState {
  items: CartItem[]
  add: (item: CartItem) => void
  remove: (productId: string) => void
  setQty: (productId: string, qty: number) => void
  clear: () => void
}
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.productId === item.productId)
          if (existing) {
            return { items: s.items.map((i) => (i.productId === item.productId ? { ...i, qty: i.qty + item.qty } : i)) }
          }
          return { items: [...s.items, item] }
        }),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items.map((i) => (i.productId === productId ? { ...i, qty: Math.max(i.moq, qty) } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: 'bc-cart', storage: createJSONStorage(() => localStorage) }
  )
)

// ============================================================
// Wishlist — persisted product IDs the user saved for later.
// ============================================================
interface WishlistState {
  ids: string[]
  toggle: (productId: string) => void
  has: (productId: string) => boolean
  clear: () => void
}
export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) =>
        set((s) => ({
          ids: s.ids.includes(productId)
            ? s.ids.filter((id) => id !== productId)
            : [...s.ids, productId],
        })),
      has: (productId) => get().ids.includes(productId),
      clear: () => set({ ids: [] }),
    }),
    { name: 'bc-wishlist', storage: createJSONStorage(() => localStorage) }
  )
)

// ============================================================
// Recently viewed — last N product IDs the user opened.
// ============================================================
interface RecentState {
  ids: string[]
  push: (productId: string) => void
}
export const useRecentStore = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (productId) =>
        set((s) => ({
          ids: [productId, ...s.ids.filter((id) => id !== productId)].slice(0, 10),
        })),
    }),
    { name: 'bc-recent', storage: createJSONStorage(() => localStorage) }
  )
)

// ============================================================
// UI — search, category, sort, market selection, scroll signals.
// ============================================================
interface UIState {
  query: string
  category: string
  sort: string
  market: string
  scrollSignal: number
  setQuery: (q: string) => void
  setCategory: (c: string) => void
  setSort: (s: string) => void
  setMarket: (m: string) => void
  triggerScroll: () => void
}
export const useUIStore = create<UIState>((set) => ({
  query: '',
  category: '',
  sort: 'popular',
  market: 'Delhi',
  scrollSignal: 0,
  setQuery: (q) => set({ query: q }),
  setCategory: (c) => set({ category: c }),
  setSort: (s) => set({ sort: s }),
  setMarket: (m) => set({ market: m }),
  triggerScroll: () => set((s) => ({ scrollSignal: s.scrollSignal + 1 })),
}))
