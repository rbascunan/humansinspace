'use client'

import { useEffect } from 'react'
import useSWR, { mutate } from 'swr'
import { createClient } from '@/lib/supabase/client'
import type { AvatarConfig, InterestId, MissionStatus, Profile } from './types'

const ME_KEY = 'his-me'
const PLAYERS_KEY = 'his-players'
const LOADING = 'loading' as const

export type Player = {
  id: string
  name: string
  team: string
  country: string | null
  avatar: AvatarConfig
  points: number
  missions: number
  medals: number
  best: Record<string, number>
}

async function fetchMe(): Promise<Profile | null> {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) return null
  const [{ data: row, error }, { data: records }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, team, country, avatar, interests, points, xp, medals, created_at')
      .eq('id', session.user.id)
      .maybeSingle(),
    supabase.from('mission_records').select('mission_id, attempts, best_score, best_status').eq('user_id', session.user.id),
  ])
  if (error) throw error
  if (!row) return null
  return {
    id: row.id,
    name: row.name,
    team: row.team,
    country: row.country,
    avatar: row.avatar as AvatarConfig,
    interests: row.interests as InterestId[],
    points: row.points,
    xp: row.xp,
    medals: row.medals,
    missions: Object.fromEntries(
      (records ?? []).map((r) => [
        r.mission_id,
        { attempts: r.attempts, bestScore: r.best_score, bestStatus: r.best_status as MissionStatus },
      ]),
    ),
    createdAt: new Date(row.created_at).getTime(),
  }
}

async function fetchPlayers(): Promise<Player[]> {
  const supabase = createClient()
  const [{ data: rows, error }, { data: records }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, name, team, country, avatar, points, medals')
      .order('points', { ascending: false })
      .limit(200),
    supabase.from('mission_records').select('user_id, mission_id, best_score, best_status'),
  ])
  if (error) throw error
  const byUser = new Map<string, { best: Record<string, number>; completed: number }>()
  for (const r of records ?? []) {
    const entry = byUser.get(r.user_id) ?? { best: {}, completed: 0 }
    entry.best[r.mission_id] = r.best_score
    if (r.best_status !== 'fallida') entry.completed += 1
    byUser.set(r.user_id, entry)
  }
  return (rows ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    team: p.team,
    country: p.country,
    avatar: p.avatar as AvatarConfig,
    points: p.points,
    medals: p.medals.length,
    missions: byUser.get(p.id)?.completed ?? 0,
    best: byUser.get(p.id)?.best ?? {},
  }))
}

export function useProfile(): Profile | null | typeof LOADING {
  const { data, isLoading } = useSWR(ME_KEY, fetchMe, { revalidateOnFocus: false })
  useEffect(() => {
    const { data: sub } = createClient().auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        mutate(ME_KEY)
        mutate(PLAYERS_KEY)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [])
  if (isLoading || data === undefined) return LOADING
  return data
}

export function usePlayers() {
  return useSWR(PLAYERS_KEY, fetchPlayers, { refreshInterval: 30_000 })
}

export function refreshProgress() {
  return Promise.all([mutate(ME_KEY), mutate(PLAYERS_KEY)])
}

export async function getAccessToken() {
  const { data } = await createClient().auth.getSession()
  return data.session?.access_token ?? null
}

export async function signIn(email: string, password: string): Promise<string | null> {
  const { error } = await createClient().auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
  if (!error) {
    await refreshProgress()
    return null
  }
  if (error.status === 400 || error.code === 'invalid_credentials') return 'Email o contraseña incorrectos.'
  if (error.status === 429) return 'Demasiados intentos. Esperá un momento y probá de nuevo.'
  return 'No pudimos iniciar sesión. Intentá de nuevo.'
}

export async function updateAvatar(profileId: string, avatar: AvatarConfig, interests: InterestId[]) {
  const { error } = await createClient()
    .from('profiles')
    .update({ avatar, interests, updated_at: new Date().toISOString() })
    .eq('id', profileId)
  if (error) throw error
  await refreshProgress()
}

export async function logout() {
  await createClient().auth.signOut()
  await mutate(ME_KEY, null, { revalidate: false })
}
