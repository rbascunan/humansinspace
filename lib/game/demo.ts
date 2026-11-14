import type { AvatarConfig } from './types'
import { ARCHETYPES } from './meta'

export type DemoPlayer = {
  id: string
  name: string
  team: string
  avatar: AvatarConfig
  points: number
  missions: number
  medals: number
  best: Record<string, number>
}

const a = (i: number, patch: Partial<AvatarConfig> = {}) => ({ ...ARCHETYPES[i].avatar, ...patch })

export const DEMO_PLAYERS: DemoPlayer[] = [
  { id: 'd1', name: 'Valen Orbita', team: 'Andes Rockets', avatar: a(2), points: 4120, missions: 7, medals: 9, best: { usat1: 1410, mars: 1290 } },
  { id: 'd2', name: 'Luz Pampa', team: 'Agro Satélites', avatar: a(0), points: 3860, missions: 6, medals: 7, best: { usat1: 1380, mars: 1120 } },
  { id: 'd3', name: 'Mati Gol', team: 'Gravedad Cero FC', avatar: a(3), points: 3410, missions: 6, medals: 6, best: { usat1: 1250, mars: 1340 } },
  { id: 'd4', name: 'Robo-K7', team: 'Taller Orbital', avatar: a(5), points: 3290, missions: 5, medals: 6, best: { usat1: 1460, mars: 980 } },
  { id: 'd5', name: 'Sol Acuarela', team: 'Estudio Nebulosa', avatar: a(1), points: 2950, missions: 5, medals: 5, best: { usat1: 1190, mars: 1050 } },
  { id: 'd6', name: 'Tomi Startup', team: 'Lunar Ventures', avatar: a(4), points: 2710, missions: 4, medals: 4, best: { usat1: 1100, mars: 1210 } },
  { id: 'd7', name: 'Abril Cumbre', team: 'Andes Rockets', avatar: a(2, { skin: '#8d5a3b', hairColor: '#facc15', outfit: '#ef4444' }), points: 2380, missions: 4, medals: 4, best: { usat1: 980, mars: 1010 } },
  { id: 'd8', name: 'Nico Beats', team: 'Estudio Nebulosa', avatar: a(1, { accessory: 'auriculares', outfit: '#eab308', hair: 'corto' }), points: 1990, missions: 3, medals: 3, best: { usat1: 1020 } },
  { id: 'd9', name: 'Zeta Glim', team: 'Taller Orbital', avatar: a(5, { base: 'fantastico', skin: '#7dd3a8', outfit: '#8b5cf6' }), points: 1640, missions: 3, medals: 2, best: { usat1: 890, mars: 760 } },
  { id: 'd10', name: 'Caro Viñedo', team: 'Agro Satélites', avatar: a(0, { skin: '#f1c7a5', hairColor: '#7a4b22', outfit: '#eab308' }), points: 1280, missions: 2, medals: 2, best: { usat1: 940 } },
]

export const TEAMS = Array.from(
  DEMO_PLAYERS.reduce((map, p) => {
    const t = map.get(p.team) ?? { name: p.team, points: 0, members: 0 }
    t.points += p.points
    t.members += 1
    map.set(p.team, t)
    return map
  }, new Map<string, { name: string; points: number; members: number }>()).values(),
).sort((x, y) => y.points - x.points)
