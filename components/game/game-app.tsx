'use client'

import { useState } from 'react'
import { BookOpen, LogOut, Orbit, Rocket, Shirt, Trophy, type LucideIcon } from 'lucide-react'
import { Avatar } from './avatar'
import { Onboarding, Logo } from './onboarding'
import { Universe, type ViewId } from './universe'
import { MissionsCatalog } from './missions-catalog'
import { MissionRunner } from './mission-runner'
import { ResultsView } from './results-view'
import { LearnView } from './learn-view'
import { HangarView } from './hangar-view'
import { getMission } from '@/lib/game/missions'
import { levelFromXp } from '@/lib/game/meta'
import { logout, useProfile } from '@/lib/game/store'
import { cn } from '@/lib/utils'

const NAV: { id: ViewId; label: string; icon: LucideIcon }[] = [
  { id: 'universo', label: 'Universo', icon: Orbit },
  { id: 'misiones', label: 'Misiones', icon: Rocket },
  { id: 'resultados', label: 'Resultados', icon: Trophy },
  { id: 'aprende', label: 'Aprender', icon: BookOpen },
  { id: 'hangar', label: 'Avatar', icon: Shirt },
]

export function GameApp() {
  const profile = useProfile()
  const [view, setView] = useState<ViewId>('universo')
  const [missionId, setMissionId] = useState<string | null>(null)

  if (profile === 'loading') {
    return (
      <main className="starfield flex min-h-dvh items-center justify-center">
        <Rocket className="size-8 animate-pulse text-primary" aria-label="Cargando" />
      </main>
    )
  }
  if (!profile) return <Onboarding />

  const mission = missionId ? getMission(missionId) : undefined
  const lvl = levelFromXp(profile.xp)
  const go = (v: ViewId) => {
    setMissionId(null)
    setView(v)
    window.scrollTo({ top: 0 })
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <button type="button" onClick={() => go('universo')} aria-label="Ir al universo">
            <Logo />
          </button>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Principal">
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => go(n.id)}
                aria-current={view === n.id ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  view === n.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <n.icon className="size-4" aria-hidden />
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="max-w-28 truncate text-sm font-semibold">{profile.name}</p>
              <p className="font-mono text-[11px] text-muted-foreground">
                Nv {lvl.level} · <span className="text-primary">{profile.points} pts</span>
              </p>
            </div>
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-full border border-border bg-card">
              <Avatar config={profile.avatar} className="mt-3 h-12 w-auto" />
            </span>
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Salir? Se borrará tu progreso de este dispositivo.')) logout()
              }}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
              aria-label="Cerrar sesión"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-5 md:pb-10">
        {mission ? (
          <MissionRunner
            key={mission.id}
            mission={mission}
            profile={profile}
            onExit={() => go('misiones')}
            onResults={() => go('resultados')}
          />
        ) : view === 'universo' ? (
          <Universe profile={profile} onEnter={go} />
        ) : view === 'misiones' ? (
          <MissionsCatalog
            profile={profile}
            onPlay={(id) => {
              setMissionId(id)
              window.scrollTo({ top: 0 })
            }}
          />
        ) : view === 'resultados' ? (
          <ResultsView profile={profile} />
        ) : view === 'aprende' ? (
          <LearnView />
        ) : (
          <HangarView profile={profile} onDone={() => go('universo')} />
        )}
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Principal"
      >
        {NAV.map((n) => {
          const active = view === n.id && !mission
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => go(n.id)}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <n.icon className="size-5" aria-hidden />
              {n.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
