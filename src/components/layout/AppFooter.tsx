'use client'
import { useNavStore } from '@/lib/store'
import { Logo } from '@/components/shared/Logo'
import { Store, Truck, Handshake, ShieldCheck, MapPin, FileText, Lock, Scale } from 'lucide-react'

export function AppFooter() {
  const navigate = useNavStore((s) => s.navigate)

  const cols: { title: string; links: { label: string; icon?: typeof Store; onClick: () => void }[] }[] = [
    {
      title: 'Sell with us',
      links: [
        { label: 'Vendor login / signup', icon: Store, onClick: () => navigate({ name: 'login' }) },
        { label: 'Transport partner login', icon: Truck, onClick: () => navigate({ name: 'login' }) },
        { label: 'Sales representative login', icon: Handshake, onClick: () => navigate({ name: 'login' }) },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About Gucchu Test', onClick: () => navigate({ name: 'about' }) },
        { label: 'Markets we serve', icon: MapPin, onClick: () => navigate({ name: 'markets' }) },
        { label: "Today's deals", onClick: () => navigate({ name: 'deals' }) },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Terms & Conditions', icon: FileText, onClick: () => navigate({ name: 'legal', doc: 'terms' }) },
        { label: 'Privacy Policy', icon: Lock, onClick: () => navigate({ name: 'legal', doc: 'privacy' }) },
        { label: 'IT & IP Protection', icon: Scale, onClick: () => navigate({ name: 'legal', doc: 'ip' }) },
      ],
    },
  ]

  return (
    <footer className="mt-auto border-t border-border bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Organised wholesale from Delhi&apos;s biggest markets, delivered pan-India with integrated transport.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
              <ShieldCheck className="h-3.5 w-3.5" /> Verified vendors
            </div>
          </div>
          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={l.onClick}
                      className="inline-flex items-center gap-1.5 text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {l.icon ? <l.icon className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                      {l.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-lg border border-dashed border-border bg-background/60 px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <MapPin className="mr-1.5 inline h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">We are trying our best to connect more markets.</span>{' '}
            Delhi is live now — Mumbai, Bengaluru and Kolkata are coming soon.
          </p>
        </div>

        <div className="mt-6 flex flex-col items-center justify-between gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>&copy; {new Date().getFullYear()} Gucchu Test Technologies Pvt. Ltd. All rights reserved.</p>
          <p className="flex items-center gap-3">
            <button onClick={() => navigate({ name: 'legal', doc: 'terms' })} className="hover:text-primary">Terms</button>
            <button onClick={() => navigate({ name: 'legal', doc: 'privacy' })} className="hover:text-primary">Privacy</button>
            <button onClick={() => navigate({ name: 'legal', doc: 'ip' })} className="hover:text-primary">IT &amp; IP</button>
          </p>
        </div>
      </div>
    </footer>
  )
}
