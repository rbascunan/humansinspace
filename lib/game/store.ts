'use client'

import { useSyncExternalStore } from 'react'
import type { AvatarConfig, InterestId, Profile, SimulationResult } from './types'

const KEY = 'his-profile-v1'
const listeners = new Set<() => void>()
let cache: Profile | null | undefined

function read(): Profile | null {
  if (cache !== undefined) return cache
  try {
    const raw = window.localStorage.getItem(KEY)
    cache = raw ? (JSON.parse(raw) as Profile) : null
  } catch {
    cache = null
  }
  return cache
}

function write(next: Profile | null) {
  cache = next
  if (next) window.localStorage.setItem(KEY, JSON.stringify(next))
  else window.localStorage.removeItem(KEY)
  listeners.forEach((l) => l())
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

const LOADING = 'loading' as const

export function useProfile(): Profile | null | typeof LOADING {
  return useSyncExternalStore<Profile | null | typeof LOADING>(subscribe, read, () => LOADING)
}

export function createProfile(input: { name: string; team: string; avatar: AvatarConfig; interests: InterestId[] }) {
  write({
    id: crypto.randomUUID(),
    name: input.name.trim().slice(0, 24) || 'Explorador',
    team: input.team.trim().slice(0, 24) || 'Equipo Libre',
    avatar: input.avatar,
    interests: input.interests,
    points: 0,
    xp: 0,
    medals: [],
    missions: {},
    createdAt: Date.now(),
  })
}

export function updateAvatar(avatar: AvatarConfig, interests?: InterestId[]) {
  const p = read()
  if (!p) return
  write({ ...p, avatar, interests: interests ?? p.interests })
}

export function recordResult(missionId: string, result: SimulationResult) {
  const p = read()
  if (!p) return
  const prev = p.missions[missionId]
  const rank = { fallida: 0, parcial: 1, exitosa: 2 } as const
  const improvement = Math.max(0, result.score - (prev?.bestScore ?? 0))
  write({
    ...p,
    points: p.points + improvement,
    xp: p.xp + result.xp,
    medals: Array.from(new Set([...p.medals, ...result.medals])),
    missions: {
      ...p.missions,
      [missionId]: {
        attempts: (prev?.attempts ?? 0) + 1,
        bestScore: Math.max(prev?.bestScore ?? 0, result.score),
        bestStatus:
          !prev || rank[result.status] > rank[prev.bestStatus] ? result.status : prev.bestStatus,
      },
    },
  })
  return improvement
}

export function logout() {
  write(null)
}
