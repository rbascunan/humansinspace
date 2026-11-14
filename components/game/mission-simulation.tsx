'use client'

import { useEffect, useState } from 'react'
import { CircleAlert, CircleCheck, FastForward, Info, Rocket, Satellite, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResourcePanel } from './resource-panel'
import type { LogTone, Mission, SimulationResult } from '@/lib/game/types'
import { cn } from '@/lib/utils'

const STEP_MS = 1600

const TONE_ICON: Record<LogTone, typeof Info> = {
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  danger: CircleAlert,
}
const TONE_CLASS: Record<LogTone, string> = {
  info: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
}

export function MissionSimulation({
  mission,
  result,
  onDone,
}: {
  mission: Mission
  result: SimulationResult
  onDone: () => void
}) {
  const [shown, setShown] = useState(0)
  const total = result.phaseLogs.length
  const finished = shown >= total

  useEffect(() => {
    if (finished) return
    const t = setTimeout(() => setShown((s) => s + 1), shown === 0 ? 600 : STEP_MS)
    return () => clearTimeout(t)
  }, [shown, finished])

  const current = shown === 0 ? result.startResources : result.phaseLogs[shown - 1].snapshot
  const progress = (shown / mission.phases.length) * 100
  const Vehicle = mission.id === 'mars' ? Rocket : Satellite
  const failed = finished && result.fatal

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="flex flex-col gap-4">
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-5">
          <div className="starfield absolute inset-0 opacity-70" aria-hidden />
          <div className="relative flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Simulación en curso</h2>
              <span className="font-mono text-xs text-muted-foreground">
                FASE {Math.min(shown, total)}/{mission.phases.length}
              </span>
            </div>
            <div className="relative h-16">
              <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-muted" />
              <div
                className={cn(
                  'absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full transition-all duration-1000',
                  failed ? 'bg-destructive' : 'bg-primary',
                )}
                style={{ width: `${progress}%` }}
              />
              {mission.phases.map((p, i) => (
                <span
                  key={p.id}
                  className={cn(
                    'absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2',
                    i < shown ? 'border-primary bg-primary' : 'border-border bg-background',
                  )}
                  style={{ left: `${((i + 1) / mission.phases.length) * 100}%` }}
                />
              ))}
              <span
                className="absolute top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground shadow-[0_0_30px_var(--color-accent)] transition-all duration-1000"
                style={{ left: `${Math.max(4, progress)}%` }}
              >
                <Vehicle className="size-5" aria-hidden />
              </span>
            </div>
          </div>
        </div>

        <ol className="flex flex-col gap-3" aria-live="polite">
          {result.phaseLogs.slice(0, shown).map((phase) => (
            <li key={phase.phaseId} className="animate-in fade-in slide-in-from-bottom-2 rounded-2xl border border-border bg-card p-4">
              <h3 className="mb-2 font-semibold">{phase.label}</h3>
              <ul className="flex flex-col gap-2">
                {phase.entries.map((e, i) => {
                  const Icon = TONE_ICON[e.tone]
                  return (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Icon className={cn('mt-0.5 size-4 shrink-0', TONE_CLASS[e.tone])} aria-hidden />
                      <span className="text-pretty">{e.text}</span>
                    </li>
                  )
                })}
              </ul>
            </li>
          ))}
          {!finished && (
            <li className="flex items-center gap-2 rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
              <span className="size-2 animate-ping rounded-full bg-primary" />
              Procesando: {mission.phases[shown]?.label ?? 'Inicio'}…
            </li>
          )}
          {finished && result.phaseLogs.length < mission.phases.length && (
            <li className="rounded-2xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
              La misión se interrumpió. Las fases restantes no se pudieron ejecutar.
            </li>
          )}
        </ol>
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <ResourcePanel specs={mission.resources} values={current} baseline={result.startResources} title="Recursos en vivo" />
        {finished ? (
          <Button className="h-12 text-base font-semibold" onClick={onDone}>
            Ver evaluación
          </Button>
        ) : (
          <Button variant="outline" className="h-11" onClick={() => setShown(total)}>
            <FastForward /> Saltar animación
          </Button>
        )}
      </aside>
    </div>
  )
}
