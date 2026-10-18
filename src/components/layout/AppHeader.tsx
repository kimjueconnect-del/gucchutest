'use client'
import { useState, useEffect } from 'react'
import { useNavStore, useUIStore, useAuthStore, useCartStore, useWishlistStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader,
} from '@/components/ui/sheet'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Search, ShoppingCart, MapPin, Menu, User, LogOut, Package, Store, Truck, Handshake, LayoutDashboard, Shield, ChevronDown, Heart,
} from 'lucide-react'
import { toast } from 'sonner'
import { useQuery } from '@tanstack/react-query'
import { ThemeToggle } from '@/components/shared/ThemeToggle'

const CATEGORIES = ['Furniture', 'Lighting & Electrical', 'Home Decor', 'Kitchen & Cookware', 'Building & Hardware']

const ROLE_DASHBOARD: Record<string, { name: string; view: 'vendor' | 'transport' | 'sales' | 'admin'; icon: typeof Store }> = {
  vendor: { name: 'Vendor Dashboard', view: 'vendor', icon: Store },
  transport: { name: 'Transport Dashboard', view: 'transport', icon: Truck },
  sales: { name: 'Sales Dashboard', view: 'sales', icon: Handshake },
  admin: { name: 'Admin Panel', view: 'admin', icon: Shield },
}

export function AppHeader() {
  const navigate = useNavStore((s) => s.navigate)
  const { query, setQuery, category, setCategory, market, triggerScroll } = useUIStore()
  const account = useAuthStore((s) => s.account)
  const cartCount = useCartStore((s) => s.items.reduce((n, i) => n + i.qty, 0))
  const wishlistCount = useWishlistStore((s) => s.ids.length)
  const [localQuery, setLocalQuery] = useState(query)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => { setLocalQuery(query) }, [query])

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery(localQuery)
    navigate({ name: 'home' })
    triggerScroll()
  }

  function pickCategory(c: string) {
    setCategory(category === c ? '' : c)
    navigate({ name: 'home' })
    triggerScroll()
    setSheetOpen(false)
  }

  const roleDash = account ? ROLE_DASHBOARD[account.role] : null

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      {/* Top row */}
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-3 md:gap-4 md:px-6">
        {/* mobile menu */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="text-left">Browse</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-1">
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categories</p>
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => pickCategory(c)}
                  className={`rounded-md px-3 py-2 text-left text-sm hover:bg-secondary ${category === c ? 'bg-secondary font-medium' : ''}`}
                >
                  {c}
                </button>
              ))}
              <div className="my-2 h-px bg-border" />
              <p className="px-2 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Explore</p>
              <button onClick={() => { navigate({ name: 'deals' }); setSheetOpen(false) }} className="rounded-md px-3 py-2 text-left text-sm hover:bg-secondary">Deals</button>
              <button onClick={() => { navigate({ name: 'markets' }); setSheetOpen(false) }} className="rounded-md px-3 py-2 text-left text-sm hover:bg-secondary">Markets</button>
              <button onClick={() => { navigate({ name: 'about' }); setSheetOpen(false) }} className="rounded-md px-3 py-2 text-left text-sm hover:bg-secondary">About</button>
            </div>
          </SheetContent>
        </Sheet>

        <Logo />

        {/* desktop search */}
        <form onSubmit={submitSearch} className="hidden flex-1 items-center md:flex">
          <div className="relative w-full max-w-2xl">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search furniture, electricals, decor, hardware…"
              className="h-10 rounded-full pl-10 pr-4"
              aria-label="Search products"
            />
          </div>
        </form>

        {/* location (desktop) */}
        <button
          onClick={() => navigate({ name: 'markets' })}
          className="hidden items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-secondary lg:flex"
        >
          <MapPin className="h-4 w-4 text-primary" />
          <span className="font-medium text-foreground">{market}</span>
        </button>

        {/* theme toggle */}
        <ThemeToggle />

        {/* account */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 px-2">
              <User className="h-5 w-5" />
              <span className="hidden text-sm font-medium sm:inline">
                {account ? account.name.split(' ')[0] : 'Account'}
              </span>
              <ChevronDown className="hidden h-3.5 w-3.5 opacity-60 sm:inline" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {account ? (
              <>
                <DropdownMenuLabel className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{account.name}</span>
                  <span className="text-xs font-normal capitalize text-muted-foreground">{account.role} · {account.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {roleDash && (
                  <DropdownMenuItem onClick={() => navigate({ name: roleDash.view })}>
                    <roleDash.icon className="mr-2 h-4 w-4" /> {roleDash.name}
                  </DropdownMenuItem>
                )}
                {account.role === 'buyer' && (
                  <DropdownMenuItem onClick={() => navigate({ name: 'orders' })}>
                    <Package className="mr-2 h-4 w-4" /> My Orders
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={async () => { await apiClient.logout(); useAuthStore.getState().setAuth(null); toast.success('Logged out'); navigate({ name: 'home' }) }}>
                  <LogOut className="mr-2 h-4 w-4" /> Log out
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuLabel>Welcome to Gucchu Test</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate({ name: 'login' })}>
                  <User className="mr-2 h-4 w-4" /> Log in
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: 'signup' })}>
                  Create account
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">Partner with us</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate({ name: 'signup', })}>
                  <Store className="mr-2 h-4 w-4" /> Sign up as Vendor
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: 'login' })}>
                  <Truck className="mr-2 h-4 w-4" /> Transport login
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate({ name: 'login' })}>
                  <Handshake className="mr-2 h-4 w-4" /> Sales person login
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* wishlist */}
        <button
          onClick={() => navigate({ name: 'wishlist' })}
          className="relative inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 hover:bg-secondary"
          aria-label={`Wishlist, ${wishlistCount} items`}
        >
          <div className="relative">
            <Heart className="h-5 w-5" />
            {wishlistCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-amber px-1 text-[10px] font-bold text-brand-amber-foreground">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </div>
        </button>

        {/* cart */}
        <button
          onClick={() => navigate({ name: 'cart' })}
          className="relative inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 hover:bg-secondary"
          aria-label={`Cart, ${cartCount} items`}
        >
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
          <span className="hidden text-sm font-medium sm:inline">Cart</span>
        </button>
      </div>

      {/* mobile search row */}
      <div className="px-3 pb-2 md:hidden">
        <form onSubmit={submitSearch}>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Search products…"
              className="h-10 rounded-full pl-10 pr-4"
              aria-label="Search products"
            />
          </div>
        </form>
      </div>

      {/* desktop category bar */}
      <div className="hidden border-t border-border bg-secondary/40 md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-6">
          <button
            onClick={() => { setCategory(''); navigate({ name: 'home' }); triggerScroll() }}
            className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${!category ? 'text-primary' : 'text-muted-foreground'}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => pickCategory(c)}
              className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${category === c ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {c}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <button onClick={() => navigate({ name: 'deals' })} className="px-3 py-2 text-sm font-medium text-brand-amber hover:underline">Today&apos;s Deals</button>
            <button onClick={() => navigate({ name: 'markets' })} className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-primary">Markets</button>
          </div>
        </div>
      </div>
    </header>
  )
}
