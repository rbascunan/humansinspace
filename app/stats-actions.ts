'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export type HomeStats = {
  players: number
  missions: number
  medals: number
  topCountries: { code: string; count: number }[]
}

export async function getHomeStats(): Promise<HomeStats> {
  const admin = createAdminClient()

  const [profilesRes, attemptsRes] = await Promise.all([
    admin.from('profiles').select('country, medals', { count: 'exact' }),
    admin.from('mission_attempts').select('id', { count: 'exact', head: true }),
  ])

  if (profilesRes.error) throw new Error('No se pudieron cargar las estadísticas')
  if (attemptsRes.error) throw new Error('No se pudieron cargar las estadísticas')

  const rows = profilesRes.data ?? []
  const byCountry = new Map<string, number>()
  let medals = 0
  for (const row of rows) {
    medals += Array.isArray(row.medals) ? row.medals.length : 0
    if (row.country) byCountry.set(row.country, (byCountry.get(row.country) ?? 0) + 1)
  }

  const topCountries = [...byCountry.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count || a.code.localeCompare(b.code))
    .slice(0, 3)

  return {
    players: profilesRes.count ?? rows.length,
    missions: attemptsRes.count ?? 0,
    medals,
    topCountries,
  }
}
