'use client'
import { useNavStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ShieldCheck, Truck, Handshake, Store, PackageCheck, Layers, MapPin, BarChart3 } from 'lucide-react'

export function AboutView() {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)

  const pillars = [
    { icon: ShieldCheck, title: 'Verified, exclusive vendors', desc: 'We personally onboard select vendors with guaranteed quality and competitive pricing. Open-market vendors join too, but exclusive partners get promoted first.' },
    { icon: Truck, title: 'Integrated transport', desc: 'No need to chase a transporter. We auto-assign a verified carrier to every order and manage the pickup-to-delivery chain.' },
    { icon: Handshake, title: 'Sales representative network', desc: 'Know someone who needs bulk goods? Refer them as a sales rep, handle the deal, and earn commission on every closed order.' },
    { icon: PackageCheck, title: 'Transparent bulk pricing', desc: 'See per-unit price, MOQ and bulk tiers upfront. The more you buy, the less you pay — no haggling, no hidden charges.' },
  ]

  return (
    <div className="mx-auto max-w-4xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <h1 className="text-2xl font-bold text-foreground md:text-3xl">About Gucchu Test</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Delhi&apos;s wholesale markets sell everything — chairs, beds, electric switches, mirrors, chandeliers, hardware. But the market is vast and disorganised, so buyers across India either can&apos;t access it or settle for lower-quality local products.
      </p>
      <p className="mt-3 text-base text-muted-foreground">
        Gucchu Test organises this sector. Vendors list products with full pricing and quality details. Buyers anywhere in India order in bulk. We connect the vendor to a verified transport partner and deliver — all without the buyer ever needing to visit Delhi or negotiate logistics.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {pillars.map((p) => (
          <div key={p.title} className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2">
              <div className="rounded-lg bg-primary/10 p-2"><p.icon className="h-4 w-4 text-primary" /></div>
              <h2 className="text-sm font-semibold text-foreground">{p.title}</h2>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <BarChart3 className="h-4 w-4 text-primary" /> How it works
        </h2>
        <ol className="mt-3 space-y-3">
          {[
            { t: 'Browse & compare', d: 'Search across categories, see real images, bulk pricing and specs.' },
            { t: 'Order in bulk', d: 'Add to cart at or above the minimum order quantity. Bulk tiers auto-apply.' },
            { t: 'We coordinate', d: 'On order, we notify the vendor and auto-assign a verified transport partner.' },
            { t: 'Delivered pan-India', d: 'The carrier picks up from the vendor and ships to your address.' },
          ].map((s, i) => (
            <li key={s.t} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{i + 1}</span>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.t}</p>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { icon: Store, title: 'Become a vendor', desc: 'List your products to buyers across India.', action: () => navigate({ name: 'signup' }) },
          { icon: Truck, title: 'Transport partner', desc: 'Get delivery assignments from our network.', action: () => navigate({ name: 'signup' }) },
          { icon: Handshake, title: 'Sales representative', desc: 'Refer buyers and earn commission per deal.', action: () => navigate({ name: 'signup' }) },
        ].map((c) => (
          <button key={c.title} onClick={c.action} className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40">
            <c.icon className="h-5 w-5 text-primary" />
            <h3 className="mt-2 text-sm font-semibold text-foreground">{c.title}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{c.desc}</p>
          </button>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-dashed border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4 text-primary" />
        <span>We are trying our best to connect more markets. Delhi is live now — Mumbai, Bengaluru and Kolkata are coming soon.</span>
      </div>
    </div>
  )
}
