'use client'

import useSWR from 'swr'
import { getHomeStats } from '@/app/stats-actions'
import { countryName } from '@/lib/game/countries'
import { Flag } from './flag'

const fmt = new Intl.NumberFormat('es-AR')

function StatCell({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <div
      className="animate-rise flex flex-1 flex-col items-center justify-center gap-1 px-2 py-4 text-center"
      style={{ animationDelay: `${delay}ms` }}
    >
      <dd className="text-3xl font-bold tabular-nums text-foreground">{value}</dd>
      <dt className="font-mono text-[10px] uppercase leading-tight tracking-[0.15em] text-muted-foreground">
        {label}
      </dt>
    </div>
  )
}

export function HomeStats() {
  const { data, error, isLoading } = useSWR('home-stats', () => getHomeStats(), {
    refreshInterval: 30000,
    revalidateOnFocus: true,
  })

  const placeholder = isLoading ? '…' : '—'
  const value = (n: number | undefined) => (n === undefined ? placeholder : fmt.format(n))

  return (
    <section
      aria-labelledby="home-stats-title"
      className="animate-rise flex w-full max-w-md flex-col gap-2"
      style={{ animationDelay: '150ms' }}
    >
      <h2
        id="home-stats-title"
        className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-accent"
      >
        <span className="size-2 animate-pulse rounded-full bg-accent" aria-hidden="true" />
        La comunidad en vivo
      </h2>
      <dl className="flex flex-col overflow-hidden rounded-2xl border-2 border-primary bg-card/80 backdrop-blur">
        <div className="flex divide-x divide-border">
          <StatCell value={value(data?.players)} label="Exploradores" delay={300} />
          <StatCell value={value(data?.missions)} label="Misiones" delay={420} />
          <StatCell value={value(data?.medals)} label="Medallas" delay={540} />
        </div>
        <div
          className="animate-rise flex flex-col gap-2 border-t border-border px-4 py-3"
          style={{ animationDelay: '660ms' }}
        >
          <dt className="text-left font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Países con más participantes
          </dt>
          <dd className="w-full">
            {data && data.topCountries.length > 0 ? (
              <ol className="flex flex-col gap-1.5">
                {data.topCountries.map((c, i) => (
                  <li key={c.code} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="w-4 font-mono text-xs text-primary">{i + 1}</span>
                      <Flag code={c.code} />
                      <span className="truncate text-foreground">{countryName(c.code)}</span>
                    </span>
                    <span className="font-mono tabular-nums text-muted-foreground">{fmt.format(c.count)}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <span className="text-sm text-muted-foreground">{placeholder}</span>
            )}
          </dd>
        </div>
      </dl>
      {error && <p className="text-xs text-muted-foreground">No se pudieron cargar las estadísticas.</p>}
    </section>
  )
}
