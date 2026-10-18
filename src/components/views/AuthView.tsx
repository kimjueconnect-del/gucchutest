'use client'
import { useState } from 'react'
import { useNavStore, useAuthStore } from '@/lib/store'
import { apiClient } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ChevronLeft, ShieldCheck, Store, Truck, Handshake, User, Eye, EyeOff, Check } from 'lucide-react'

const DEMO = [
  { label: 'Admin', email: 'admin@gucchutest.com', password: 'Admin@123456' },
  { label: 'Buyer', email: 'buyer@demo.com', password: 'Buyer@123456' },
  { label: 'Vendor', email: 'rajesh@delhifurniture.in', password: 'Vendor@123456' },
  { label: 'Transport', email: 'cargo@fastmove.in', password: 'Transport@123456' },
  { label: 'Sales', email: 'arjun@sales.gucchutest.com', password: 'Sales@123456' },
]

const ROLES = [
  { value: 'buyer', label: 'Buyer', icon: User },
  { value: 'vendor', label: 'Vendor', icon: Store },
  { value: 'transport', label: 'Transport', icon: Truck },
  { value: 'sales', label: 'Sales Rep', icon: Handshake },
]

function pwStrength(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (/[a-z]/.test(pw)) score++
  if (/[A-Z]/.test(pw)) score++
  if (/[0-9]/.test(pw)) score++
  if (/[^a-zA-Z0-9]/.test(pw)) score++
  return score
}

export function AuthView({ mode }: { mode: 'login' | 'signup' }) {
  const navigate = useNavStore((s) => s.navigate)
  const back = useNavStore((s) => s.back)
  const setAuth = useAuthStore((s) => s.setAuth)
  const [tab, setTab] = useState<'login' | 'signup'>(mode)
  const [role, setRole] = useState('buyer')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState<Record<string, string>>({
    email: '', password: '', name: '', phone: '',
    businessName: '', gstin: '', market: 'Delhi',
    companyName: '', vehicleTypes: '', coverageAreas: '', baseRate: '15',
    region: 'Delhi NCR', website: '', // website = honeypot
  })
  function update(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })) }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (tab === 'login') {
        const res = await apiClient.login({ email: form.email.trim().toLowerCase(), password: form.password })
        setAuth(res.account)
        toast.success('Logged in')
        redirectAfterLogin(res.account.role)
      } else {
        const body: Record<string, unknown> = {
          email: form.email.trim().toLowerCase(), password: form.password, name: form.name.trim(),
          phone: form.phone.trim(), role, website: form.website, // honeypot
        }
        if (role === 'vendor') { body.businessName = form.businessName.trim(); body.gstin = form.gstin.trim(); body.market = form.market }
        if (role === 'transport') {
          body.companyName = form.companyName.trim()
          body.vehicleTypes = form.vehicleTypes.split(',').map((s) => s.trim()).filter(Boolean)
          body.coverageAreas = form.coverageAreas.split(',').map((s) => s.trim()).filter(Boolean)
          body.baseRate = Number(form.baseRate) || 0
        }
        if (role === 'sales') body.region = form.region
        const res = await apiClient.signup(body)
        setAuth(res.account)
        toast.success('Account created')
        redirectAfterLogin(res.account.role)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function redirectAfterLogin(r: string) {
    if (r === 'admin') navigate({ name: 'admin' })
    else if (r === 'vendor') navigate({ name: 'vendor' })
    else if (r === 'transport') navigate({ name: 'transport' })
    else if (r === 'sales') navigate({ name: 'sales' })
    else navigate({ name: 'home' })
  }

  const strength = pwStrength(form.password)
  const strengthLabel = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][strength]
  const strengthColor = ['bg-destructive', 'bg-destructive', 'bg-brand-amber', 'bg-primary', 'bg-primary', 'bg-primary'][strength]

  return (
    <div className="mx-auto max-w-md px-3 py-6 md:py-10">
      <button onClick={back} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ChevronLeft className="h-4 w-4" /> Back
      </button>

      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="text-lg font-bold text-foreground">{tab === 'login' ? 'Welcome back' : 'Create your account'}</h1>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as 'login' | 'signup')} className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="signup">Sign up</TabsTrigger>
          </TabsList>
        </Tabs>

        <form onSubmit={submit} className="space-y-3">
          {/* honeypot — hidden from real users */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={form.website}
            onChange={(e) => update('website', e.target.value)}
            className="absolute left-[-9999px] h-0 w-0 opacity-0"
            aria-hidden
          />

          {tab === 'signup' && (
            <div>
              <Label className="mb-1.5 block text-xs">I am joining as</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {ROLES.map((r) => (
                  <button
                    type="button"
                    key={r.value}
                    onClick={() => setRole(r.value)}
                    className={`flex flex-col items-center gap-1 rounded-lg border p-2 text-[11px] font-medium transition-colors ${role === r.value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/40'}`}
                  >
                    <r.icon className="h-4 w-4" />
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" required value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="you@example.com" autoComplete="email" />
          </div>

          {tab === 'signup' && (
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Your name" autoComplete="name" />
            </div>
          )}

          {tab === 'signup' && (
            <div className="space-y-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+91 98XXXXXXXX" autoComplete="tel" />
            </div>
          )}

          {tab === 'signup' && role === 'vendor' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="businessName">Business name</Label>
                <Input id="businessName" required value={form.businessName} onChange={(e) => update('businessName', e.target.value)} placeholder="e.g. Delhi Furniture House" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label htmlFor="gstin">GSTIN (optional)</Label>
                  <Input id="gstin" value={form.gstin} onChange={(e) => update('gstin', e.target.value)} placeholder="07AAAAA0000A1Z5" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="market">Market</Label>
                  <Input id="market" value={form.market} onChange={(e) => update('market', e.target.value)} placeholder="Delhi" />
                </div>
              </div>
            </>
          )}

          {tab === 'signup' && role === 'transport' && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Company name</Label>
                <Input id="companyName" required value={form.companyName} onChange={(e) => update('companyName', e.target.value)} placeholder="e.g. FastMove Cargo" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="vehicleTypes">Vehicle types (comma-separated)</Label>
                <Input id="vehicleTypes" value={form.vehicleTypes} onChange={(e) => update('vehicleTypes', e.target.value)} placeholder="Truck (3.5T), Tempo, Container" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="coverageAreas">Coverage areas (comma-separated)</Label>
                <Input id="coverageAreas" value={form.coverageAreas} onChange={(e) => update('coverageAreas', e.target.value)} placeholder="Delhi NCR, Haryana, Punjab" />
              </div>
            </>
          )}

          {tab === 'signup' && role === 'sales' && (
            <div className="space-y-1.5">
              <Label htmlFor="region">Operating region</Label>
              <Input id="region" value={form.region} onChange={(e) => update('region', e.target.value)} placeholder="Delhi NCR" />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPw ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => update('password', e.target.value)}
                placeholder="Min 8 chars, mix of letters, digits, symbols"
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" aria-label={showPw ? 'Hide password' : 'Show password'}>
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {tab === 'signup' && form.password.length > 0 && (
              <div className="space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`h-1 flex-1 rounded-full ${i <= strength ? strengthColor : 'bg-secondary'}`} />
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">{strengthLabel}</p>
              </div>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Please wait…' : tab === 'login' ? 'Log in' : 'Create account'}
          </Button>

          <p className="text-center text-[11px] text-muted-foreground">
            <ShieldCheck className="mr-1 inline h-3 w-3" />
            Protected by rate-limiting, strong-password checks and bot honeypots. We never store passwords in plain text.
          </p>
        </form>
      </div>

      {/* Demo credentials quick-fill */}
      <div className="mt-4 rounded-xl border border-dashed border-border bg-background/60 p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Demo accounts (trial only)</p>
        <div className="flex flex-wrap gap-1.5">
          {DEMO.map((d) => (
            <button
              key={d.label}
              onClick={() => {
                setTab('login')
                update('email', d.email)
                update('password', d.password)
              }}
              className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Check className="h-3 w-3 text-primary" /> {d.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">Tap a role to auto-fill credentials, then press Log in.</p>
      </div>
    </div>
  )
}
