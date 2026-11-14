'use client'

import Image from 'next/image'
import { Lock, Play, Sparkles } from 'lucide-react'
import { MISSIONS } from '@/lib/game/missions'
import { INTERESTS } from '@/lib/game/meta'
import type { Profile } from '@/lib/game/types'
import { cn } from '@/lib/utils'

const STATUS_LABEL = { exitosa: 'Exitosa', parcial: 'Parcial', fallida: 'Fallida' } as const

export function MissionsCatalog({ profile, onPlay }: { profile: Profile; onPlay: (id: string) => void }) {
  const sorted = [...MISSIONS].sort((a, b) => {
    const score = (m: typeof a) =>
      (m.playable ? 10 : 0) + m.interests.filter((i) => profile.interests.includes(i)).length
    return score(b) - score(a)
  })

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="hud-label">Centro de misiones</p>
        <h1 className="text-3xl font-bold uppercase tracking-wide">Misiones</h1>
        <p className="text-pretty text-muted-foreground">
          Planificá, tomá decisiones, administrá recursos y simulá. Las recomendadas coinciden con tus intereses.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {sorted.map((m) => {
          const matches = m.interests.filter((i) => profile.interests.includes(i))
          const record = profile.missions[m.id]
          return (
            <article
              key={m.id}
              className={cn('hud group flex flex-col overflow-hidden transition-transform', m.playable && 'hover:-translate-y-1')}
              style={{ ['--cut' as string]: '20px' }}
            >
              <div className="relative">
                <Image
                  src={m.image}
                  alt={`Ilustración de ${m.title}`}
                  width={800}
                  height={450}
                  className={cn('aspect-video w-full object-cover', !m.playable && 'opacity-60 grayscale-[40%]')}
                />
                <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                  {matches.length > 0 && (
                    <span className="flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground">
                      <Sparkles className="size-3" aria-hidden /> Recomendada
                    </span>
                  )}
                  <span className="rounded-full bg-background/80 px-2.5 py-1 text-xs backdrop-blur">{m.difficulty}</span>
                </div>
                {record && (
                  <span className="absolute right-3 top-3 rounded-full bg-background/80 px-2.5 py-1 font-mono text-xs backdrop-blur">
                    {STATUS_LABEL[record.bestStatus]} · {record.bestScore} pts
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <p className="font-mono text-xs text-accent">
                    {m.code} · {m.org}
                  </p>
                  <h2 className="text-xl font-bold">{m.title}</h2>
                  <p className="mt-1 text-pretty text-sm text-muted-foreground">{m.summary}</p>
                </div>
                <p className="text-pretty text-sm">
                  <span className="font-semibold text-warning">Desafío: </span>
                  {m.problem}
                </p>
                {matches.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Para vos por: {matches.map((i) => INTERESTS.find((x) => x.id === i)?.label).join(', ')}
                  </p>
                )}
                <div className="mt-auto">
                  {m.playable ? (
                    <button
                      type="button"
                      onClick={() => onPlay(m.id)}
                      className="btn-game h-12 w-full"
                    >
                      <Play className="size-4" aria-hidden /> {record ? 'Jugar otra vez' : 'Iniciar misión'}
                    </button>
                  ) : (
                    <p className="flex h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                      <Lock className="size-4" aria-hidden /> Próximamente
                    </p>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        Las misiones son simulaciones educativas inspiradas en proyectos reales. Las fallas son ficticias y las
        organizaciones mencionadas no patrocinan este juego.
      </p>
    </div>
  )
}
