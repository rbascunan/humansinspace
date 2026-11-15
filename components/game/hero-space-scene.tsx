import type { ReactNode } from 'react'

function Rocket() {
  return (
    <svg viewBox="0 0 40 72" className="h-full w-full" aria-hidden="true">
      <path d="M14 56 L20 70 L26 56 Z" fill="var(--primary)" className="animate-flame" />
      <path d="M8 44 L14 36 L14 54 L8 56 Z" fill="var(--primary)" />
      <path d="M32 44 L26 36 L26 54 L32 56 Z" fill="var(--primary)" />
      <path d="M20 2 C29 12 30 26 28 56 L12 56 C10 26 11 12 20 2 Z" fill="#e8ecf5" />
      <path d="M20 2 C25 7 27 12 28 17 L12 17 C13 12 15 7 20 2 Z" fill="var(--primary)" />
      <circle cx="20" cy="30" r="5" fill="var(--accent)" stroke="#1e2240" strokeWidth="2" />
    </svg>
  )
}

function Satellite() {
  return (
    <svg viewBox="0 0 80 40" className="h-full w-full" aria-hidden="true">
      <rect x="2" y="12" width="24" height="16" rx="1" fill="var(--accent)" opacity="0.85" />
      <path d="M10 12 V28 M18 12 V28" stroke="#0b0d1f" strokeWidth="1.5" opacity="0.5" />
      <rect x="54" y="12" width="24" height="16" rx="1" fill="var(--accent)" opacity="0.85" />
      <path d="M62 12 V28 M70 12 V28" stroke="#0b0d1f" strokeWidth="1.5" opacity="0.5" />
      <path d="M26 20 H54" stroke="#9aa3bf" strokeWidth="2" />
      <rect x="31" y="10" width="18" height="20" rx="3" fill="#c9cfdf" />
      <rect x="31" y="17" width="18" height="3" fill="var(--primary)" />
      <path d="M40 10 V3" stroke="#9aa3bf" strokeWidth="2" />
      <circle cx="40" cy="3" r="2" fill="var(--primary)" />
    </svg>
  )
}

const STARS = [
  [8, 14],
  [22, 70],
  [36, 28],
  [58, 10],
  [72, 62],
  [90, 34],
  [48, 84],
  [14, 46],
]

export function HeroSpaceScene({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card/60">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {STARS.map(([x, y]) => (
          <span
            key={`${x}-${y}`}
            className="absolute size-0.5 rounded-full bg-foreground/60"
            style={{ left: `${x}%`, top: `${y}%` }}
          />
        ))}
        <div className="absolute left-1/2 top-[62%] h-40 w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border border-dashed border-primary/30" />
        <div className="absolute -right-8 -top-8 size-28 rounded-full bg-[radial-gradient(circle_at_35%_35%,#f59e5b,#c2410c_70%)] opacity-90" />
        <div className="absolute -right-12 top-6 h-6 w-44 -rotate-12 rounded-[50%] border border-primary/40" />
        <div className="animate-drift-satellite absolute left-5 top-6 h-8 w-16 opacity-90">
          <Satellite />
        </div>
        <div className="animate-drift-rocket absolute right-3 bottom-5 h-14 w-8 rotate-[24deg]">
          <Rocket />
        </div>
      </div>
      <div className="flex items-end justify-center gap-2 px-4 pt-16 pb-6">{children}</div>
    </div>
  )
}
