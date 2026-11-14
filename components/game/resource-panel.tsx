import { Battery, DollarSign, Fuel, HeartPulse, Radio, Weight, type LucideIcon } from 'lucide-react'
import { RESOURCE_META } from '@/lib/game/meta'
import type { ResourceKey, ResourceSpec } from '@/lib/game/types'
import { cn } from '@/lib/utils'

export const RESOURCE_ICONS: Record<ResourceKey, LucideIcon> = {
  budget: DollarSign,
  energy: Battery,
  fuel: Fuel,
  mass: Weight,
  comms: Radio,
  survival: HeartPulse,
}

export function ResourcePanel({
  specs,
  values,
  baseline,
  compact = false,
  title = 'Tablero de control',
}: {
  specs: ResourceSpec[]
  values: Record<ResourceKey, number>
  baseline?: Record<ResourceKey, number>
  compact?: boolean
  title?: string
}) {
  if (compact) {
    return (
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {specs.map((s) => (
          <Meter key={s.key} spec={s} value={values[s.key]} baseline={baseline?.[s.key]} compact />
        ))}
      </div>
    )
  }
  return (
    <section aria-label={title} className="hud flex flex-col gap-4 p-4">
      <h3 className="hud-label">{title}</h3>
      {specs.map((s) => (
        <Meter key={s.key} spec={s} value={values[s.key]} baseline={baseline?.[s.key]} />
      ))}
    </section>
  )
}

function Meter({
  spec,
  value,
  baseline,
  compact,
}: {
  spec: ResourceSpec
  value: number
  baseline?: number
  compact?: boolean
}) {
  const meta = RESOURCE_META[spec.key]
  const Icon = RESOURCE_ICONS[spec.key]
  const pct = Math.max(0, Math.min(100, (value / spec.max) * 100))
  const over = spec.limitIsCeiling ? value > spec.max : value < 0
  const low = !spec.limitIsCeiling && spec.key !== 'budget' && pct <= 20
  const delta = baseline !== undefined ? value - baseline : 0
  const color = over ? 'var(--color-destructive)' : low ? 'var(--color-warning)' : meta.color

  if (compact) {
    return (
      <div className={cn('flex flex-col gap-1 rounded-xl border bg-card px-2 py-1.5', over ? 'border-destructive' : 'border-border')}>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Icon className="size-3" style={{ color }} aria-hidden />
          <span className="truncate">{meta.label}</span>
        </div>
        <p className="font-mono text-sm font-semibold leading-none">
          {value}
          <span className="text-[10px] font-normal text-muted-foreground"> {spec.unit}</span>
        </p>
        <div className="h-1 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 font-medium">
          <span className="flex size-7 items-center justify-center rounded-lg bg-muted">
            <Icon className="size-4" style={{ color }} aria-hidden />
          </span>
          {meta.label}
        </span>
        <span className="font-mono">
          <span className={cn('font-semibold', over && 'text-destructive')}>{value}</span>
          <span className="text-muted-foreground">
            {spec.limitIsCeiling ? ` / ${spec.max} máx` : ` / ${spec.max}`} {spec.unit}
          </span>
          {delta !== 0 && (
            <span className={cn('ml-2 text-xs', delta > 0 === !spec.limitIsCeiling ? 'text-success' : 'text-destructive')}>
              {delta > 0 ? '+' : ''}
              {delta}
            </span>
          )}
        </span>
      </div>
      <div
        className="relative h-3 overflow-hidden rounded-sm border border-border bg-muted"
        role="meter"
        aria-label={meta.label}
        aria-valuemin={0}
        aria-valuemax={spec.max}
        aria-valuenow={value}
      >
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: `repeating-linear-gradient(90deg, ${color} 0 8px, color-mix(in oklch, ${color} 70%, black) 8px 10px)`,
          }}
        />
      </div>
      {over && (
        <p className="text-xs text-destructive">
          {spec.limitIsCeiling ? 'Supera el límite permitido' : 'Sin fondos suficientes'}
        </p>
      )}
    </div>
  )
}
