'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { COUNTRY_CODES } from '@/lib/game/countries'
import { INTERESTS } from '@/lib/game/meta'
import { getMission } from '@/lib/game/missions'
import { simulate, type Choices } from '@/lib/game/simulate'
import type { AvatarConfig, MissionRecord, MissionStatus, Profile } from '@/lib/game/types'

type SignUpInput = {
  email: string
  password: string
  name: string
  team: string
  country: string
  avatar: AvatarConfig
  interests: string[]
}

const INTEREST_IDS = new Set(INTERESTS.map((i) => i.id as string))
const AVATAR_KEYS = ['base', 'skin', 'hair', 'hairColor', 'outfit', 'accessory', 'suit', 'profession'] as const

function cleanAvatar(input: unknown): AvatarConfig | null {
  if (!input || typeof input !== 'object') return null
  const out: Record<string, string> = {}
  for (const k of AVATAR_KEYS) {
    const v = (input as Record<string, unknown>)[k]
    if (typeof v !== 'string' || v.length > 40) return null
    out[k] = v
  }
  return out as AvatarConfig
}

export async function signUpPlayer(input: SignUpInput): Promise<{ ok: true } | { error: string }> {
  const email = String(input.email ?? '').trim().toLowerCase()
  const password = String(input.password ?? '')
  const name = String(input.name ?? '').trim().slice(0, 24)
  const team = String(input.team ?? '').trim().slice(0, 24)
  const country = String(input.country ?? '').toUpperCase()
  const avatar = cleanAvatar(input.avatar)
  const interests = Array.isArray(input.interests) ? input.interests.filter((i) => INTEREST_IDS.has(i)) : []

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 120) return { error: 'Ingresá un email válido.' }
  if (password.length < 8 || password.length > 72) return { error: 'La contraseña debe tener entre 8 y 72 caracteres.' }
  if (!name) return { error: 'Ingresá tu nombre de jugador.' }
  if (!COUNTRY_CODES.has(country)) return { error: 'Elegí tu país.' }
  if (!avatar) return { error: 'El avatar no es válido.' }
  if (!interests.length) return { error: 'Elegí al menos un interés.' }

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name, team: team || 'Equipo Libre', country, avatar, interests },
  })
  if (error) {
    if (error.code === 'email_exists' || error.status === 422) {
      return { error: 'Ese email ya tiene una cuenta. Usá "Ya tengo cuenta" para ingresar.' }
    }
    if (error.code === 'weak_password') return { error: 'La contraseña es muy débil. Probá con una más larga.' }
    console.error('[signUpPlayer]', error.code, error.message)
    return { error: 'No pudimos crear la cuenta. Intentá de nuevo en un momento.' }
  }
  return { ok: true }
}

export async function submitMissionResult(
  accessToken: string,
  missionId: string,
  rawChoices: Record<string, string>,
): Promise<{ pointsAwarded: number } | { error: string }> {
  const admin = createAdminClient()
  const { data: auth, error: authError } = await admin.auth.getUser(accessToken)
  if (authError || !auth.user) return { error: 'Sesión vencida. Volvé a ingresar.' }
  const userId = auth.user.id

  const mission = getMission(missionId)
  if (!mission?.playable) return { error: 'Misión no disponible.' }

  const choices: Choices = {}
  for (const d of mission.decisions) {
    const picked = rawChoices?.[d.id]
    if (typeof picked === 'string' && d.options.some((o) => o.id === picked)) choices[d.id] = picked
  }

  const [{ data: row }, { data: records }] = await Promise.all([
    admin.from('profiles').select('id, name, team, country, avatar, interests, points, xp, medals').eq('id', userId).single(),
    admin.from('mission_records').select('mission_id, attempts, best_score, best_status').eq('user_id', userId),
  ])
  if (!row) return { error: 'Perfil no encontrado.' }

  const profile: Profile = {
    id: row.id,
    name: row.name,
    team: row.team,
    country: row.country,
    avatar: row.avatar as AvatarConfig,
    interests: row.interests,
    points: row.points,
    xp: row.xp,
    medals: row.medals,
    missions: Object.fromEntries(
      (records ?? []).map((r) => [
        r.mission_id,
        { attempts: r.attempts, bestScore: r.best_score, bestStatus: r.best_status as MissionStatus } satisfies MissionRecord,
      ]),
    ),
    createdAt: 0,
  }

  const result = simulate(mission, choices, profile)
  const { data: awarded, error } = await admin.rpc('record_mission_result', {
    p_user: userId,
    p_mission: mission.id,
    p_status: result.status,
    p_score: Math.round(result.score),
    p_xp: Math.round(result.xp),
    p_medals: result.medals,
    p_choices: choices,
  })
  if (error) {
    console.error('[submitMissionResult]', error.message)
    return { error: 'No pudimos guardar el resultado.' }
  }
  return { pointsAwarded: awarded ?? 0 }
}
