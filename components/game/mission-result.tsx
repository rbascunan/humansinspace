'use client'

import { Award, CircleCheck, CircleX, Lightbulb, RotateCcw, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RESOURCE_ICONS } from './resource-panel'
import { MEDALS, RESOURCE_META } from '@/lib/game/meta'
import type { Mission, SimulationResult } from '@/lib/game/types'
import { cn } from '@/lib/utils'

const STATUS_STYLE = {
  exitosa: 'border-success/60 bg-success/10 text-success',
  parcial: 'border-warning/60 bg-warning/10 text-warning',
  fallida: 'border-destructive/60 bg-destructive/10 text-destructive',
} as const

function ResourceSummary({ mission, result }: { mission: Mission; result: SimulationResult }) {
  return (
    <section aria-labelledby="resource-summary-title" className="hud flex flex-col gap-3 p-4">
      <h3 id="resource-summary-title" className="hud-label">
        Balance de recursos
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="py-2 pr-2 font-medium">Recurso</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Al despegar</th>
              <th scope="col" className="px-2 py-2 text-right font-medium">Al finalizar</th>
              <th scope="col" className="py-2 pl-2 text-right font-medium">Cambio</th>
            </tr>
          </thead>
          <tbody>
            {mission.resources.map((spec) => {
              const meta = RESOURCE_META[spec.key]
              const Icon = RESOURCE_ICONS[spec.key]
              const start = result.startResources[spec.key]
              const end = result.finalResources[spec.key]
              const delta = end - start
              const good = delta > 0 === !spec.limitIsCeiling
              const limit = spec.limitIsCeiling ? `máx ${spec.max}` : `de ${spec.max}`
              return (
                <tr key={spec.key} className="border-b border-border/60 last:border-0">
                  <th scope="row" className="py-2.5 pr-2 text-left font-medium">
                    <span className="flex items-center gap-2">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="size-4" style={{ color: meta.color }} aria-hidden />
                      </span>
                      <span>
                        {meta.label}
                        <span className="block font-mono text-[11px] font-normal text-muted-foreground">
                          {limit} {spec.unit}
                        </span>
                      </span>
                    </span>
                  </th>
                  <td className="px-2 py-2.5 text-right font-mono">{start}</td>
                  <td className="px-2 py-2.5 text-right font-mono font-semibold">{end}</td>
                  <td
                    className={cn(
                      'py-2.5 pl-2 text-right font-mono',
                      delta === 0 ? 'text-muted-foreground' : good ? 'text-success' : 'text-destructive',
                    )}
                  >
                    {delta === 0 ? 'sin cambio' : `${delta > 0 ? '+' : ''}${delta}`}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export function MissionResult({
  mission,
  result,
  pointsGained,
  onRetry,
  onResults,
  onExit,
}: {
  mission: Mission
  result: SimulationResult
  pointsGained: number
  onRetry: () => void
  onResults: () => void
  onExit: () => void
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4">
        <section className={cn('rounded-3xl border p-5 md:p-6', STATUS_STYLE[result.status])}>
          <p className="font-mono text-xs uppercase tracking-widest">Resultado · {mission.title}</p>
          <h2 className="text-3xl font-bold md:text-4xl">{result.headline}</h2>
          <p className="mt-2 text-pretty text-foreground">{result.explanation}</p>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h3 className="mb-3 font-semibold">Objetivos</h3>
          <ul className="flex flex-col gap-2">
            {result.objectives.map((o) => (
              <li key={o.id} className="flex items-start gap-2 text-sm">
                {o.done ? (
                  <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" aria-label="Logrado" />
                ) : (
                  <CircleX className="mt-0.5 size-4 shrink-0 text-destructive" aria-label="Pendiente" />
                )}
                <span className={o.done ? '' : 'text-muted-foreground'}>{o.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {result.recommendations.length > 0 && (
          <section className="rounded-2xl border border-primary/40 bg-primary/5 p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <Lightbulb className="size-4 text-primary" aria-hidden /> Para el próximo intento
            </h3>
            <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm text-muted-foreground">
              {result.recommendations.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </section>
        )}

        <ResourceSummary mission={mission} result={result} />
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-end justify-between">
            <h3 className="font-semibold">Puntuación</h3>
            <span className="font-mono text-3xl font-bold text-primary">{result.score}</span>
          </div>
          <ul className="flex flex-col gap-1.5 text-sm">
            {result.breakdown.map((b) => (
              <li key={b.label} className="flex justify-between gap-2">
                <span className="text-muted-foreground">{b.label}</span>
                <span className={cn('font-mono', b.value < 0 ? 'text-destructive' : 'text-foreground')}>
                  {b.value > 0 ? '+' : ''}
                  {b.value}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 border-t border-border pt-3 text-sm">
            <span className="flex-1 rounded-lg bg-muted px-2 py-1.5 text-center">
              <span className="block font-mono font-semibold text-accent">+{result.xp}</span> de experiencia
            </span>
            <span className="flex-1 rounded-lg bg-muted px-2 py-1.5 text-center">
              <span className="block font-mono font-semibold text-primary">+{pointsGained}</span> al ranking
            </span>
          </div>
          {pointsGained === 0 && (
            <p className="text-xs text-muted-foreground">Al ranking suma solo cuando superás tu mejor puntaje.</p>
          )}
        </section>

        {result.medals.length > 0 && (
          <section className="flex flex-col gap-2 rounded-2xl border border-accent/50 bg-accent/10 p-4">
            <h3 className="flex items-center gap-2 font-semibold text-accent">
              <Award className="size-4" aria-hidden /> Medallas obtenidas
            </h3>
            {result.medals.map((m) => (
              <div key={m} className="flex items-center gap-2 text-sm">
                <span className="flex size-8 items-center justify-center rounded-full bg-accent text-accent-foreground">
                  <Award className="size-4" aria-hidden />
                </span>
                <span>
                  <span className="font-semibold">{MEDALS[m]?.label}</span>
                  <span className="block text-xs text-muted-foreground">{MEDALS[m]?.description}</span>
                </span>
              </div>
            ))}
          </section>
        )}

        <Button className="h-12 text-base font-semibold" onClick={onRetry}>
          <RotateCcw /> Reintentar con otra estrategia
        </Button>
        <Button variant="outline" className="h-11" onClick={onResults}>
          <Trophy /> Ver resultados y ranking
        </Button>
        <Button variant="ghost" className="h-10" onClick={onExit}>
          Elegir otra misión
        </Button>
      </aside>
    </div>
  )
}
