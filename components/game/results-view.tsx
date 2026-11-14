'use client'

import { useState } from 'react'
import { Award, Medal, Rocket, Star, Users } from 'lucide-react'
import { Avatar } from './avatar'
import { Flag } from './flag'
import { usePlayers, type Player } from '@/lib/game/store'
import { countryName } from '@/lib/game/countries'
import { MEDALS, levelFromXp, levelTitle } from '@/lib/game/meta'
import { MISSIONS } from '@/lib/game/missions'
import type { Profile } from '@/lib/game/types'
import { cn } from '@/lib/utils'

export function ResultsView({ profile }: { profile: Profile }) {
  const [tab, setTab] = useState<'mine' | 'global'>('mine')
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Torre de resultados</p>
          <h1 className="text-3xl font-bold">Resultados</h1>
        </div>
        <div className="flex rounded-full border border-border bg-card p-1 text-sm" role="tablist">
          {(
            [
              ['mine', 'Mi progreso'],
              ['global', 'Resultados globales'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                'rounded-full px-4 py-1.5 font-medium',
                tab === id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {tab === 'mine' ? <MyProgress profile={profile} /> : <GlobalResults profile={profile} />}
    </div>
  )
}

function MyProgress({ profile }: { profile: Profile }) {
  const lvl = levelFromXp(profile.xp)
  const completed = Object.values(profile.missions).filter((m) => m.bestStatus !== 'fallida').length
  const attempts = Object.values(profile.missions).reduce((a, m) => a + m.attempts, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
      <section className="flex flex-col items-center gap-3 rounded-3xl border border-border bg-card p-5 text-center">
        <Avatar config={profile.avatar} className="animate-float h-40 w-auto" />
        <div>
          <h2 className="text-xl font-bold">{profile.name}</h2>
          <p className="text-sm text-muted-foreground">
            {profile.avatar.profession} · {profile.team}
          </p>
        </div>
        <div className="w-full">
          <div className="flex justify-between text-sm">
            <span className="font-semibold">
              Nivel {lvl.level} · {levelTitle(lvl.level)}
            </span>
            <span className="font-mono text-muted-foreground">{lvl.toNext} XP para subir</span>
          </div>
          <div className="mt-1.5 h-3 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${lvl.progress * 100}%` }} />
          </div>
        </div>
        <div className="grid w-full grid-cols-3 gap-2">
          <Stat label="Puntos" value={profile.points} />
          <Stat label="XP" value={profile.xp} />
          <Stat label="Completas" value={completed} />
        </div>
        <p className="text-xs text-muted-foreground">{attempts} intentos en total. ¡Cada intento enseña algo nuevo!</p>
      </section>

      <div className="flex flex-col gap-4">
        <section className="rounded-3xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Award className="size-4 text-accent" aria-hidden /> Medallas
          </h3>
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-4">
            {Object.entries(MEDALS).map(([id, m]) => {
              const has = profile.medals.includes(id)
              return (
                <li
                  key={id}
                  className={cn(
                    'flex flex-col items-center gap-1 rounded-2xl border p-3 text-center',
                    has ? 'border-accent/60 bg-accent/10' : 'border-border opacity-50',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full',
                      has ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground',
                    )}
                  >
                    <Medal className="size-5" aria-hidden />
                  </span>
                  <span className="text-sm font-semibold">{m.label}</span>
                  <span className="text-[11px] text-muted-foreground">{has ? m.description : 'Bloqueada'}</span>
                </li>
              )
            })}
          </ul>
        </section>
        <section className="rounded-3xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Rocket className="size-4 text-primary" aria-hidden /> Mis misiones
          </h3>
          <ul className="flex flex-col divide-y divide-border">
            {MISSIONS.filter((m) => m.playable).map((m) => {
              const r = profile.missions[m.id]
              return (
                <li key={m.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span>
                    <span className="font-medium">{m.title}</span>
                    <span className="block text-xs text-muted-foreground">
                      {r ? `${r.attempts} intento(s)` : 'Sin jugar todavía'}
                    </span>
                  </span>
                  {r && (
                    <span className="text-right font-mono">
                      <span className="block font-semibold text-primary">{r.bestScore} pts</span>
                      <span className="text-xs capitalize text-muted-foreground">{r.bestStatus}</span>
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        </section>
      </div>
    </div>
  )
}

function GlobalResults({ profile }: { profile: Profile }) {
  const [missionId, setMissionId] = useState<string>('all')
  const me: Player = {
    id: profile.id,
    name: profile.name,
    team: profile.team,
    country: profile.country,
    avatar: profile.avatar,
    points: profile.points,
    missions: Object.values(profile.missions).filter((m) => m.bestStatus !== 'fallida').length,
    medals: profile.medals.length,
    best: Object.fromEntries(Object.entries(profile.missions).map(([k, v]) => [k, v.bestScore])),
  }
  const { data: players, isLoading } = usePlayers()
  const all: Player[] = [...(players ?? []).filter((p) => p.id !== me.id), me]
  const TEAMS = Array.from(
    all
      .reduce((map, p) => {
        const t = map.get(p.team) ?? { name: p.team, points: 0, members: 0 }
        t.points += p.points
        t.members += 1
        map.set(p.team, t)
        return map
      }, new Map<string, { name: string; points: number; members: number }>())
      .values(),
  )
    .sort((x, y) => y.points - x.points)
    .slice(0, 8)
  const value = (p: Player) => (missionId === 'all' ? p.points : (p.best[missionId] ?? 0))
  const ranking = all.filter((p) => value(p) > 0 || p.id === me.id).sort((a, b) => value(b) - value(a))
  const totalMissions = all.reduce((a, p) => a + p.missions, 0)
  const totalMedals = all.reduce((a, p) => a + p.medals, 0)

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section className="rounded-3xl border border-border bg-card p-4 md:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 font-semibold">
            <Star className="size-4 text-accent" aria-hidden /> Ranking
          </h3>
          <label className="flex items-center gap-2 text-sm">
            <span className="sr-only">Filtrar ranking</span>
            <select
              value={missionId}
              onChange={(e) => setMissionId(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background px-2 text-sm"
            >
              <option value="all">General</option>
              {MISSIONS.filter((m) => m.playable).map((m) => (
                <option key={m.id} value={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <ol className="flex flex-col gap-1.5">
          {ranking.map((p, i) => (
            <li
              key={p.id}
              className={cn(
                'flex items-center gap-3 rounded-xl px-2 py-1.5',
                p.id === me.id ? 'bg-primary/15 ring-1 ring-primary' : i < 3 ? 'bg-muted/60' : '',
              )}
            >
              <span
                className={cn(
                  'w-7 text-center font-mono text-sm font-bold',
                  i === 0 ? 'text-accent' : i < 3 ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {i + 1}
              </span>
              <Avatar config={p.avatar} className="h-10 w-auto shrink-0" title={p.name} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">
                  {p.name} {p.id === me.id && <span className="text-xs text-primary">(vos)</span>}
                </span>
                <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                  <Flag code={p.country} className="h-3 w-4" />
                  <span className="truncate">
                    {countryName(p.country)} · {p.team}
                  </span>
                </span>
              </span>
              <span className="hidden text-xs text-muted-foreground sm:block">{p.medals} medallas</span>
              <span className="font-mono font-semibold">{value(p)}</span>
            </li>
          ))}
        </ol>
      </section>
      <div className="flex flex-col gap-4">
        <section className="grid grid-cols-2 gap-2">
          <Stat label="Jugadores" value={all.length} />
          <Stat label="Misiones completas" value={totalMissions} />
          <Stat label="Medallas" value={totalMedals} />
          <Stat label="Equipos" value={TEAMS.length} />
        </section>
        <section className="rounded-3xl border border-border bg-card p-4">
          <h3 className="mb-3 flex items-center gap-2 font-semibold">
            <Users className="size-4 text-primary" aria-hidden /> Mejores equipos
          </h3>
          <ol className="flex flex-col gap-2">
            {TEAMS.map((t, i) => (
              <li key={t.name} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  <span className="mr-2 font-mono text-muted-foreground">{i + 1}</span>
                  {t.name}
                  <span className="ml-1 text-xs text-muted-foreground">· {t.members}</span>
                </span>
                <span className="font-mono">{t.points}</span>
              </li>
            ))}
          </ol>
        </section>
        <p className="text-xs text-muted-foreground">
          {isLoading ? 'Cargando ranking global…' : 'Ranking global en vivo. Se actualiza cada 30 segundos.'}
        </p>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-muted px-2 py-2 text-center">
      <p className="font-mono text-lg font-bold">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  )
}
