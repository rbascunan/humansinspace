import type { AvatarConfig, InterestId, ResourceKey } from './types'

export const RESOURCE_META: Record<ResourceKey, { label: string; color: string; description: string }> = {
  budget: { label: 'Presupuesto', color: 'var(--color-chart-3)', description: 'Dinero disponible' },
  energy: { label: 'Energía', color: 'var(--color-chart-4)', description: 'Electricidad / batería' },
  fuel: { label: 'Combustible', color: 'var(--color-chart-5)', description: 'Capacidad de desplazamiento' },
  mass: { label: 'Masa', color: 'var(--color-chart-2)', description: 'Peso de la carga' },
  comms: { label: 'Comunicación', color: 'var(--color-chart-1)', description: 'Capacidad de contacto' },
  survival: { label: 'Supervivencia', color: 'var(--color-success)', description: 'Protección de la tripulación' },
}

export const INTERESTS: { id: InterestId; label: string }[] = [
  { id: 'campo', label: 'Campo y agricultura' },
  { id: 'arte', label: 'Arte y creatividad' },
  { id: 'montana', label: 'Montaña y aventura' },
  { id: 'deportes', label: 'Deportes' },
  { id: 'negocios', label: 'Negocios' },
  { id: 'tecnologia', label: 'Tecnología' },
  { id: 'naturaleza', label: 'Naturaleza' },
  { id: 'construccion', label: 'Construcción' },
  { id: 'musica', label: 'Música' },
  { id: 'ciencia', label: 'Ciencia' },
]

export const ARCHETYPES: {
  id: string
  label: string
  tagline: string
  interests: InterestId[]
  avatar: AvatarConfig
}[] = [
  {
    id: 'agro',
    label: 'Agricultora',
    tagline: 'Cuida la Tierra desde el espacio',
    interests: ['campo', 'naturaleza'],
    avatar: {
      base: 'humano',
      skin: '#c68863',
      hair: 'largo',
      hairColor: '#5b3a1e',
      outfit: '#4ca85f',
      accessory: 'sombrero',
      suit: 'explorador',
      profession: 'Agricultora',
    },
  },
  {
    id: 'artista',
    label: 'Artista',
    tagline: 'Diseña naves y estaciones',
    interests: ['arte', 'musica'],
    avatar: {
      base: 'humano',
      skin: '#8d5a3b',
      hair: 'rulos',
      hairColor: '#e05ab4',
      outfit: '#8b5cf6',
      accessory: 'boina',
      suit: 'colorido',
      profession: 'Artista',
    },
  },
  {
    id: 'montana',
    label: 'Montañista',
    tagline: 'Explora rutas en Marte',
    interests: ['montana', 'naturaleza'],
    avatar: {
      base: 'humano',
      skin: '#f1c7a5',
      hair: 'corto',
      hairColor: '#2b2b2b',
      outfit: '#f97316',
      accessory: 'casco',
      suit: 'explorador',
      profession: 'Montañista',
    },
  },
  {
    id: 'deporte',
    label: 'Deportista',
    tagline: 'Entrena astronautas',
    interests: ['deportes'],
    avatar: {
      base: 'humano',
      skin: '#5e3a26',
      hair: 'cresta',
      hairColor: '#facc15',
      outfit: '#0ea5e9',
      accessory: 'gorra',
      suit: 'aerodinamico',
      profession: 'Deportista',
    },
  },
  {
    id: 'negocios',
    label: 'Emprendedor',
    tagline: 'Administra misiones',
    interests: ['negocios', 'tecnologia'],
    avatar: {
      base: 'humano',
      skin: '#e0ac85',
      hair: 'corto',
      hairColor: '#7a4b22',
      outfit: '#1e293b',
      accessory: 'corbata',
      suit: 'elegante',
      profession: 'Emprendedor',
    },
  },
  {
    id: 'robot',
    label: 'Robot inventor',
    tagline: 'Repara satélites',
    interests: ['tecnologia', 'ciencia', 'construccion'],
    avatar: {
      base: 'robot',
      skin: '#94a3b8',
      hair: 'ninguno',
      hairColor: '#22d3ee',
      outfit: '#22d3ee',
      accessory: 'gafas',
      suit: 'clasico',
      profession: 'Inventor',
    },
  },
]

export const SKIN_COLORS = ['#f1c7a5', '#e0ac85', '#c68863', '#8d5a3b', '#5e3a26', '#94a3b8', '#7dd3a8', '#a78bfa']
export const HAIR_COLORS = ['#2b2b2b', '#5b3a1e', '#7a4b22', '#facc15', '#e05ab4', '#22d3ee', '#f8fafc']
export const OUTFIT_COLORS = ['#4ca85f', '#8b5cf6', '#f97316', '#0ea5e9', '#1e293b', '#ef4444', '#22d3ee', '#eab308']

export const MEDALS: Record<string, { label: string; description: string }> = {
  explorador: { label: 'Explorador espacial', description: 'Completaste tu primera misión.' },
  perfecta: { label: 'Misión perfecta', description: 'Todos los objetivos sin ningún problema.' },
  recursos: { label: 'Experto en recursos', description: 'Terminaste con buena reserva de recursos.' },
  estratega: { label: 'Ingeniero estratégico', description: 'Éxito sin eventos críticos.' },
  rescatista: { label: 'Rescatista satelital', description: 'Recuperaste el USAT-1.' },
  pionero: { label: 'Pionero marciano', description: 'Aterrizaste en Marte.' },
  lunar: { label: 'Arquitecto lunar', description: 'Construiste una base lunar habitable.' },
  lanzador: { label: 'Pionero mendocino', description: 'Pusiste MendoSat en órbita y hablaste con él.' },
  equipo: { label: 'Trabajo en equipo', description: 'Tu equipo completó misiones juntos.' },
}

export const XP_PER_LEVEL = 400

export function levelFromXp(xp: number) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const into = xp % XP_PER_LEVEL
  return { level, into, progress: into / XP_PER_LEVEL, toNext: XP_PER_LEVEL - into }
}

export const LEVEL_TITLES = ['Cadete', 'Tripulante', 'Especialista', 'Ingeniero de vuelo', 'Comandante', 'Leyenda espacial']

export function levelTitle(level: number) {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]
}
