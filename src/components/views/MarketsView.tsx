'use client'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useNavStore, useUIStore } from '@/lib/store'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronLeft, MapPin, CheckCircle2, Clock, Truck, Building2 } from 'lucide-react'

export function MarketsView() {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const setMarket = useUIStore((s) => s.setMarket)
  const q = useQuery({ queryKey: ['markets'], queryFn: () => apiClient.markets })

  return (
    <div className="mx-auto max-w-5xl px-3 py-4 md:px-6 md:py-6">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>
      <div className="mb-2 flex items-center gap-2">
        <MapPin className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground md:text-2xl">Markets we serve</h1>
      </div>
      <p className="mb-5 rounded-lg border border-dashed border-border bg-background/60 px-4 py-3 text-sm text-muted-foreground">
        We are trying our best to connect more markets. Delhi is live now — more regions are on the way.
      </p>

      {q.isLoading ? (
        <div className="grid gap-3 md:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {q.data?.items?.map((m) => (
            <div key={m.id} className={`rounded-xl border p-5 ${m.active ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-secondary p-2"><Building2 className="h-5 w-5 text-foreground" /></div>
                  <div>
                    <h2 className="text-base font-bold text-foreground">{m.name}</h2>
                    <p className="text-xs text-muted-foreground">{m.region}</p>
                  </div>
                </div>
                {m.active ? (
                  <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" /> Live</Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Coming soon</Badge>
                )}
              </div>
              {m.description && <p className="mt-3 text-sm text-muted-foreground">{m.description}</p>}
              {m.active && (
                <Button size="sm" className="mt-3" onClick={() => { setMarket(m.region); navigate({ name: 'home' }) }}>
                  Shop {m.region} market
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Truck className="h-4 w-4 text-primary" /> Integrated transport
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Every order is auto-assigned to a verified transport partner. We coordinate pickup from the vendor and delivery to your address — you never have to arrange logistics yourself.
        </p>
      </div>
    </div>
  )
}
