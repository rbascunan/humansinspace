'use client'

import { useState } from 'react'
import { BookOpen, LogOut, Orbit, Rocket, Shirt, Trophy, type LucideIcon } from 'lucide-react'
import { Avatar } from './avatar'
import { Flag } from './flag'
import { Onboarding, Logo } from './onboarding'
import { Universe, type ViewId } from './universe'
import { MissionsCatalog } from './missions-catalog'
import { MissionRunner } from './mission-runner'
import { ResultsView } from './results-view'
import { LearnView } from './learn-view'
import { HangarView } from './hangar-view'
import { getMission } from '@/lib/game/missions'
import { levelFromXp, levelTitle } from '@/lib/game/meta'
import { logout, useProfile } from '@/lib/game/store'
import { cn } from '@/lib/utils'
import { CreditsFooter } from './credits-footer'

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
      <header className="sticky top-0 z-30 border-b-2 border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <button type="button" onClick={() => go('universo')} aria-label="Ir al universo">
            <Logo />
          </button>
          <nav className="hidden h-full items-stretch md:flex" aria-label="Principal">
            {NAV.map((n) => {
              const active = view === n.id && !mission
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => go(n.id)}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex items-center gap-2 px-3 text-xs font-bold uppercase tracking-wider transition-colors',
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <n.icon className="size-4" aria-hidden />
                  {n.label}
                  {active && <span className="absolute inset-x-2 -bottom-0.5 h-1 rounded-t bg-primary" aria-hidden />}
                </button>
              )
            })}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden min-w-32 flex-col gap-1 sm:flex">
              <p className="flex items-baseline justify-between gap-2 leading-none">
                <span className="flex min-w-0 items-center gap-1.5">
                  <Flag code={profile.country} />
                  <span className="max-w-28 truncate text-sm font-bold">{profile.name}</span>
                </span>
                <span className="font-mono text-[11px] text-primary">{profile.points} pts</span>
              </p>
              <div
                className="h-1.5 w-full overflow-hidden rounded-sm bg-muted"
                role="meter"
                aria-label={`Experiencia del nivel ${lvl.level}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(lvl.progress * 100)}
              >
                <div className="xp-bar h-full transition-all" style={{ width: `${Math.max(4, lvl.progress * 100)}%` }} />
              </div>
              <p className="font-mono text-[10px] uppercase leading-none text-muted-foreground">
                {levelTitle(lvl.level)} · {lvl.toNext} XP al Nv {lvl.level + 1}
              </p>
            </div>
            <span className="relative">
              <span className="flex size-11 items-center justify-center overflow-hidden rounded-lg border-2 border-accent bg-card">
                <Avatar config={profile.avatar} className="mt-3 h-12 w-auto" />
              </span>
              <span className="absolute -bottom-1.5 -right-1.5 flex size-5 items-center justify-center rounded bg-primary font-mono text-[10px] font-bold text-primary-foreground">
                {lvl.level}
              </span>
            </span>
            <button
              type="button"
              onClick={() => {
                if (confirm('¿Cerrar sesión? Tu progreso queda guardado en tu cuenta.')) logout()
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
        <CreditsFooter className="mt-10" />
      </main>

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t-2 border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
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
                'relative flex flex-col items-center gap-0.5 py-2 text-[10px] font-bold uppercase tracking-wide',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {active && <span className="absolute inset-x-4 top-0 h-1 rounded-b bg-primary" aria-hidden />}
              <n.icon className="size-5" aria-hidden />
              {n.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
