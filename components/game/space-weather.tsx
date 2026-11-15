'use client'

import useSWR from 'swr'
import { Atom, Globe, Orbit, Sun, Waves, Zap, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { IndicatorId, SpaceWeatherPayload, WeatherStatus } from '@/lib/space-weather/classify'

const ICONS: Record<IndicatorId, LucideIcon> = {
  sun: Sun,
  flares: Zap,
  cme: Orbit,
  storms: Globe,
  particles: Atom,
  shocks: Waves,
}

const ICON_TONE: Record<IndicatorId, string> = {
  sun: 'text-primary',
  flares: 'text-warning',
  cme: 'text-accent',
  storms: 'text-success',
  particles: 'text-destructive',
  shocks: 'text-accent',
}

const STATUS: Record<WeatherStatus, { label: string; dot: string; text: string }> = {
  bien: { label: 'BIEN', dot: 'bg-success', text: 'text-success' },
  medio: { label: 'MEDIO', dot: 'bg-warning', text: 'text-warning' },
  complicado: { label: 'COMPLICADO', dot: 'bg-destructive', text: 'text-destructive' },
  'sin-datos': { label: 'SIN DATOS', dot: 'bg-muted-foreground/50', text: 'text-muted-foreground' },
}

const fetcher = async (url: string): Promise<SpaceWeatherPayload> => {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

const PLACEHOLDER: IndicatorId[] = ['sun', 'flares', 'cme', 'storms', 'particles', 'shocks']
const LABELS: Record<IndicatorId, string> = {
  sun: 'SOL',
  flares: 'LLAMARADAS',
  cme: 'EYECCIONES',
  storms: 'TORMENTAS',
  particles: 'PARTÍCULAS',
  shocks: 'CHOQUES',
}
const SUBTITLE: Record<IndicatorId, string> = {
  sun: 'SÍNTESIS',
  flares: 'SOLARES',
  cme: 'DE MASA CORONAL',
  storms: 'GEOMAGNÉTICAS',
  particles: 'ENERGÉTICAS',
  shocks: 'INTERPLANETARIOS',
}

function formatUpdated(iso: string | null) {
  if (!iso) return 'sin datos'
  return new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
}

export function SpaceWeather() {
  const { data, error, isLoading } = useSWR('/api/space-weather', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10 * 60 * 1000,
  })

  const hasData = Boolean(data?.updatedAt)
  const badge = isLoading
    ? { label: 'CARGANDO', className: 'border-border text-muted-foreground' }
    : !hasData || error
      ? { label: 'SIN CONEXIÓN', className: 'border-border text-muted-foreground' }
      : data?.stale
        ? { label: 'DESACTUALIZADO', className: 'border-warning/40 bg-warning/10 text-warning' }
        : { label: 'EN VIVO', className: 'border-success/40 bg-success/10 text-success' }

  return (
    <section aria-labelledby="space-weather-title" className="rounded-3xl border border-border bg-card p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 id="space-weather-title" className="text-lg font-bold tracking-wide">
            CLIMA ESPACIAL
          </h3>
          <p className="font-mono text-[11px] uppercase tracking-widest text-accent">
            Datos reales de clima espacial de la NASA
          </p>
        </div>
        <span
          className={cn(
            'flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold tracking-widest',
            badge.className,
          )}
        >
          {badge.label === 'EN VIVO' && (
            <span className="size-1.5 animate-pulse rounded-full bg-success" aria-hidden="true" />
          )}
          {badge.label}
        </span>
      </header>

      <ul className="mt-5 grid grid-cols-3 gap-x-2 gap-y-5 sm:grid-cols-6">
        {(data?.indicators ?? PLACEHOLDER.map((id) => ({ id, label: LABELS[id], name: '', status: 'sin-datos' as const, detail: '' }))).map(
          (indicator) => {
            const Icon = ICONS[indicator.id]
            const status = STATUS[indicator.status]
            return (
              <li key={indicator.id} className="flex flex-col items-center gap-1.5 text-center">
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
                  <Icon className={cn('size-5', ICON_TONE[indicator.id])} aria-hidden="true" />
                </span>
                <span className="text-xs font-semibold tracking-wide">{indicator.label}</span>
                <span className="font-mono text-[9px] tracking-widest text-muted-foreground">
                  {SUBTITLE[indicator.id]}
                </span>
                {isLoading ? (
                  <span className="h-3 w-12 animate-pulse rounded-full bg-muted" aria-hidden="true" />
                ) : (
                  <>
                    <span className={cn('size-2.5 rounded-full', status.dot)} aria-hidden="true" />
                    <span className={cn('font-mono text-[11px] font-semibold tracking-wider', status.text)}>
                      {status.label}
                    </span>
                    {indicator.detail && (
                      <span className="text-pretty text-[10px] leading-tight text-muted-foreground">
                        {indicator.detail}
                      </span>
                    )}
                    <span className="sr-only">{indicator.name}</span>
                  </>
                )}
              </li>
            )
          },
        )}
      </ul>

      <footer className="mt-5 flex flex-col gap-1 border-t border-border pt-3 text-[11px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span className="font-mono uppercase tracking-widest text-accent/80">Fuente de datos: NASA DONKI · FLR · CME · GST · SEP · IPS</span>
        <span>
          Última actualización: {isLoading ? '…' : formatUpdated(data?.updatedAt ?? null)}
          {data?.stale ? ' (desactualizado)' : ''}
        </span>
      </footer>
      <p className="mt-2 text-[10px] leading-relaxed text-muted-foreground/80">
        Datos extraídos de &quot;APIs oficiales de la NASA&quot; (últimos 7 días).
      </p>
    </section>
  )
}
