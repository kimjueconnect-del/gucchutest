'use client'
import { useNavStore } from '@/lib/store'

export function Logo({ className = '', showText = true }: { className?: string; showText?: boolean }) {
  const navigate = useNavStore((s) => s.navigate)
  return (
    <button
      onClick={() => navigate({ name: 'home' })}
      className={`flex items-center gap-2 ${className}`}
      aria-label="Gucchu Test home"
    >
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" className="shrink-0">
        <rect x="2" y="2" width="28" height="28" rx="7" fill="var(--primary)" />
        <rect x="8" y="8" width="7" height="7" rx="1.6" fill="var(--primary-foreground)" />
        <rect x="17" y="8" width="7" height="7" rx="1.6" fill="var(--brand-amber)" />
        <rect x="8" y="17" width="7" height="7" rx="1.6" fill="var(--brand-amber)" />
        <rect x="17" y="17" width="7" height="7" rx="1.6" fill="var(--primary-foreground)" />
      </svg>
      {showText && (
        <span className="font-bold text-lg tracking-tight text-foreground">
          Gucchu<span className="text-primary">Test</span>
        </span>
      )}
    </button>
  )
}
