'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AvatarEditor } from './avatar-editor'
import { InterestPicker } from './interest-picker'
import { updateAvatar } from '@/lib/game/store'
import type { Profile } from '@/lib/game/types'
import { MEDALS, levelFromXp, levelTitle } from '@/lib/game/meta'
import { Kit, type KitPiece } from './kit'
import { cn } from '@/lib/utils'

const MEDAL_PIECES: Record<string, KitPiece> = {
  explorador: 'rover',
  perfecta: 'planet-5',
  recursos: 'generator',
  estratega: 'satellite-dish-large',
  rescatista: 'ship-speeder',
  pionero: 'hangar-large',
  equipo: 'astronaut-a',
}

function InventoryPanel({ profile }: { profile: Profile }) {
  const lvl = levelFromXp(profile.xp)
  const completed = Object.keys(profile.missions).length
  return (
    <section className="hud hud-warm flex flex-col gap-4 p-4 md:flex-row md:items-center" aria-label="Inventario y logros">
      <div className="flex shrink-0 items-center gap-4 md:w-64">
        <span className="slot relative flex size-20 items-center justify-center rounded-lg border-2 border-accent">
          <Kit piece="astronaut-b" size={56} />
          <span className="absolute -bottom-2 -right-2 flex size-7 items-center justify-center rounded bg-primary font-mono text-xs font-bold text-primary-foreground">
            {lvl.level}
          </span>
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="hud-label">Rango</p>
          <p className="truncate font-bold">{levelTitle(lvl.level)}</p>
          <div className="h-2 overflow-hidden rounded-sm bg-muted">
            <div className="xp-bar h-full" style={{ width: `${Math.max(4, lvl.progress * 100)}%` }} />
          </div>
          <p className="font-mono text-[11px] text-muted-foreground">
            {completed} misiones · {profile.points} pts
          </p>
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="hud-label">
          Inventario de medallas · {profile.medals.length}/{Object.keys(MEDALS).length}
        </p>
        <ul className="grid grid-cols-4 gap-2 sm:grid-cols-7">
          {Object.entries(MEDALS).map(([id, m]) => {
            const owned = profile.medals.includes(id)
            return (
              <li
                key={id}
                title={`${m.label}: ${m.description}`}
                className={cn(
                  'slot flex aspect-square flex-col items-center justify-center gap-0.5 rounded-md border p-1',
                  owned ? 'border-primary' : 'border-dashed border-border',
                )}
              >
                <Kit
                  piece={MEDAL_PIECES[id] ?? 'meteor'}
                  size={40}
                  alt={owned ? m.label : `${m.label} (bloqueada)`}
                  className={cn(!owned && 'opacity-30 grayscale')}
                />
                <span className="line-clamp-1 text-center text-[9px] font-semibold leading-tight">{m.label}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}

export function HangarView({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [avatar, setAvatar] = useState(profile.avatar)
  const [interests, setInterests] = useState(profile.interests)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Hangar</p>
          <h1 className="text-3xl font-bold">Tu avatar y tus intereses</h1>
        </div>
        <Button
          className="h-11 px-5 font-semibold"
          disabled={!interests.length}
          onClick={async () => {
            try {
              await updateAvatar(profile.id, avatar, interests)
              onDone()
            } catch (e) {
              console.error('[hangar] could not save avatar:', e)
              alert('No pudimos guardar los cambios. Intentá de nuevo.')
            }
          }}
        >
          <Check /> Guardar cambios
        </Button>
      </div>
      <InventoryPanel profile={profile} />
      <AvatarEditor value={avatar} onChange={setAvatar} />
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Intereses</h2>
        <InterestPicker value={interests} onChange={setInterests} />
      </section>
    </div>
  )
}
