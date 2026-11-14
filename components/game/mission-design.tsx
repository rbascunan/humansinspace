'use client'

import { useMemo, useState } from 'react'
import { CircleHelp, Rocket, ThumbsDown, ThumbsUp, TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResourcePanel } from './resource-panel'
import { RESOURCE_META } from '@/lib/game/meta'
import { getConcept } from '@/lib/game/glossary'
import { planIssues, planResources, type Choices } from '@/lib/game/simulate'
import type { Decision, Mission, ResourceKey } from '@/lib/game/types'
import { cn } from '@/lib/utils'

export function MissionDesign({
  mission,
  choices,
  onChange,
  onLaunch,
}: {
  mission: Mission
  choices: Choices
  onChange: (update: (prev: Choices) => Choices) => void
  onLaunch: () => void
}) {
  const baseline = useMemo(() => planResources(mission, {}).res, [mission])
  const planned = planResources(mission, choices).res
  const { blocking, warnings } = planIssues(mission, choices)
  const answered = mission.decisions.filter((d) => choices[d.id]).length

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
      <div className="sticky top-14 z-10 -mx-4 border-b border-border bg-background/90 px-4 py-2 backdrop-blur lg:hidden">
        <ResourcePanel specs={mission.resources} values={planned} baseline={baseline} compact />
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold">Decisiones de ingeniería</h2>
          <p className="text-sm text-muted-foreground">
            Cada opción tiene ventajas y consecuencias. Mirá cómo cambia el tablero antes de lanzar.
          </p>
        </div>
        {mission.decisions.map((d, i) => (
          <DecisionCard
            key={d.id}
            index={i}
            decision={d}
            selected={choices[d.id]}
            onSelect={(optionId) => onChange((prev) => ({ ...prev, [d.id]: optionId }))}
          />
        ))}
      </div>

      <aside className="flex flex-col gap-4 lg:sticky lg:top-20 lg:self-start">
        <div className="hidden lg:block">
          <ResourcePanel specs={mission.resources} values={planned} baseline={baseline} />
        </div>
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
          <p className="text-sm">
            <span className="font-mono font-semibold text-primary">
              {answered}/{mission.decisions.length}
            </span>{' '}
            decisiones tomadas
          </p>
          {[...blocking, ...warnings].map((w) => (
            <p
              key={w}
              className={cn(
                'flex items-start gap-2 text-xs',
                blocking.includes(w) ? 'text-destructive' : 'text-warning',
              )}
            >
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {w}
            </p>
          ))}
          <Button className="h-12 text-base font-semibold" disabled={blocking.length > 0} onClick={onLaunch}>
            <Rocket /> Lanzar simulación
          </Button>
        </div>
      </aside>
    </div>
  )
}

function DecisionCard({
  decision,
  index,
  selected,
  onSelect,
}: {
  decision: Decision
  index: number
  selected?: string
  onSelect: (id: string) => void
}) {
  const [showConcept, setShowConcept] = useState(false)
  const concept = getConcept(decision.conceptId)

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4" aria-labelledby={`q-${decision.id}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-accent">DECISIÓN {index + 1}</p>
          <h3 id={`q-${decision.id}`} className="text-lg font-semibold">
            {decision.question}
          </h3>
          <p className="text-sm text-muted-foreground">{decision.hint}</p>
        </div>
        {concept && (
          <Button
            variant="ghost"
            size="sm"
            aria-expanded={showConcept}
            onClick={() => setShowConcept((s) => !s)}
            className="shrink-0 text-primary"
          >
            <CircleHelp /> Aprender
          </Button>
        )}
      </div>
      {concept && showConcept && (
        <div className="rounded-xl border border-primary/40 bg-primary/10 p-3 text-sm">
          <p className="font-semibold">{concept.term}</p>
          <p className="text-pretty text-muted-foreground">{concept.simple}</p>
          <p className="mt-1 text-pretty text-xs text-primary">{concept.example}</p>
        </div>
      )}
      <div className="grid gap-2 md:grid-cols-3" role="radiogroup" aria-labelledby={`q-${decision.id}`}>
        {decision.options.map((o) => {
          const active = selected === o.id
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(o.id)}
              className={cn(
                'flex flex-col gap-2 rounded-xl border p-3 text-left transition-all',
                active
                  ? 'border-primary bg-primary/10 shadow-[0_0_20px_-8px_var(--color-primary)]'
                  : 'border-border bg-background/40 hover:border-primary/60',
              )}
            >
              <span className="font-semibold">{o.label}</span>
              <span className="text-xs text-muted-foreground">{o.description}</span>
              <span className="flex items-start gap-1.5 text-xs text-success">
                <ThumbsUp className="mt-0.5 size-3 shrink-0" aria-hidden /> {o.pros}
              </span>
              <span className="flex items-start gap-1.5 text-xs text-warning">
                <ThumbsDown className="mt-0.5 size-3 shrink-0" aria-hidden /> {o.cons}
              </span>
              <EffectChips effects={o.effects} />
            </button>
          )
        })}
      </div>
    </section>
  )
}

function EffectChips({ effects }: { effects: Partial<Record<ResourceKey, number>> }) {
  const entries = Object.entries(effects).filter(([, v]) => v) as [ResourceKey, number][]
  if (!entries.length) return <span className="mt-auto font-mono text-[11px] text-muted-foreground">Sin costo</span>
  return (
    <span className="mt-auto flex flex-wrap gap-1">
      {entries.map(([k, v]) => {
        const good = k === 'mass' ? v < 0 : v > 0
        return (
          <span
            key={k}
            className={cn(
              'rounded-md px-1.5 py-0.5 font-mono text-[11px]',
              good ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive',
            )}
          >
            {v > 0 ? '+' : ''}
            {v} {RESOURCE_META[k].label}
          </span>
        )
      })}
    </span>
  )
}
