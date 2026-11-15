'use client'

import useSWR from 'swr'
import { getHomeStats } from '@/app/stats-actions'
import { countryName } from '@/lib/game/countries'
import { Flag } from './flag'

const fmt = new Intl.NumberFormat('es-AR')

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4 py-6 text-center">
      <dd className="text-4xl font-bold tabular-nums text-foreground md:text-5xl">{value}</dd>
      <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</dt>
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
    <section aria-labelledby="home-stats-title" className="flex flex-col gap-3">
      <h2 id="home-stats-title" className="font-mono text-xs uppercase tracking-[0.3em] text-accent">
        La comunidad en vivo
      </h2>
      <dl className="flex flex-col divide-y divide-border rounded-2xl border-2 border-primary bg-card/80 backdrop-blur md:flex-row md:divide-x md:divide-y-0">
        <StatCell value={value(data?.players)} label="Exploradores" />
        <StatCell value={value(data?.missions)} label="Misiones realizadas" />
        <StatCell value={value(data?.medals)} label="Medallas entregadas" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-4 py-6 text-center">
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
              <span className="text-4xl font-bold text-foreground md:text-5xl">{placeholder}</span>
            )}
          </dd>
          <dt className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Países con más participantes
          </dt>
        </div>
      </dl>
      {error && <p className="text-xs text-muted-foreground">No se pudieron cargar las estadísticas.</p>}
    </section>
  )
}
