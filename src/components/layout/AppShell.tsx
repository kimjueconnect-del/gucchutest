'use client'
import { useEffect, type ReactNode } from 'react'
import { useAuthStore, useNavStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { AppHeader } from './AppHeader'
import { AppFooter } from './AppFooter'
import { HomeView } from '@/components/views/HomeView'
import { ProductView } from '@/components/views/ProductView'
import { CartView } from '@/components/views/CartView'
import { WishlistView } from '@/components/views/WishlistView'
import { CheckoutView } from '@/components/views/CheckoutView'
import { DealsView } from '@/components/views/DealsView'
import { MarketsView } from '@/components/views/MarketsView'
import { AboutView } from '@/components/views/AboutView'
import { OrdersView } from '@/components/views/OrdersView'
import { AuthView } from '@/components/views/AuthView'
import { VendorDashboard } from '@/components/views/VendorDashboard'
import { TransportDashboard } from '@/components/views/TransportDashboard'
import { SalesDashboard } from '@/components/views/SalesDashboard'
import { AdminPanel } from '@/components/views/AdminPanel'
import { LegalView } from '@/components/views/LegalView'

function ActiveView() {
  const view = useNavStore((s) => s.view)
  switch (view.name) {
    case 'home': return <HomeView />
    case 'product': return <ProductView productId={view.productId} />
    case 'cart': return <CartView />
    case 'wishlist': return <WishlistView />
    case 'checkout': return <CheckoutView />
    case 'deals': return <DealsView />
    case 'markets': return <MarketsView />
    case 'about': return <AboutView />
    case 'orders': return <OrdersView />
    case 'login': return <AuthView mode="login" />
    case 'signup': return <AuthView mode="signup" />
    case 'vendor': return <VendorDashboard />
    case 'transport': return <TransportDashboard />
    case 'sales': return <SalesDashboard />
    case 'admin': return <AdminPanel />
    case 'legal': return <LegalView doc={view.doc} />
    default: return <HomeView />
  }
}

export function AppShell({ children }: { children?: ReactNode }) {
  const setAuth = useAuthStore((s) => s.setAuth)
  const setHydrated = useAuthStore((s) => s.setHydrated)

  useEffect(() => {
    let active = true
    apiClient
      .me()
      .then((r) => { if (active) setAuth(r.account, r.profile) })
      .catch(() => { if (active) setAuth(null) })
      .finally(() => { if (active) setHydrated(true) })
    return () => { active = false }
  }, [setAuth, setHydrated])

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1">
        <ActiveView />
      </main>
      <AppFooter />
    </div>
  )
}
