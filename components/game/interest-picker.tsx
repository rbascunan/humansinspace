'use client'

import {
  Atom,
  Briefcase,
  Cpu,
  Hammer,
  Leaf,
  Mountain,
  Music,
  Palette,
  Trophy,
  Wheat,
  type LucideIcon,
} from 'lucide-react'
import { INTERESTS } from '@/lib/game/meta'
import type { InterestId } from '@/lib/game/types'
import { cn } from '@/lib/utils'

export const INTEREST_ICONS: Record<InterestId, LucideIcon> = {
  campo: Wheat,
  arte: Palette,
  montana: Mountain,
  deportes: Trophy,
  negocios: Briefcase,
  tecnologia: Cpu,
  naturaleza: Leaf,
  construccion: Hammer,
  musica: Music,
  ciencia: Atom,
}

export function InterestPicker({
  value,
  onChange,
}: {
  value: InterestId[]
  onChange: (next: InterestId[]) => void
}) {
  const toggle = (id: InterestId) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id])

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {INTERESTS.map((i) => {
        const Icon = INTEREST_ICONS[i.id]
        const active = value.includes(i.id)
        return (
          <button
            key={i.id}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(i.id)}
            className={cn(
              'flex flex-col items-center gap-2 rounded-2xl border p-4 text-center text-sm font-medium transition-all',
              active
                ? 'border-primary bg-primary/15 text-foreground shadow-[0_0_24px_-6px_var(--color-primary)]'
                : 'border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground',
            )}
          >
            <Icon className={cn('size-7', active ? 'text-primary' : '')} aria-hidden />
            {i.label}
          </button>
        )
      })}
    </div>
  )
}
