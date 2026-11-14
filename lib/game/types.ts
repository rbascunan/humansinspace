export type ResourceKey =
  | 'budget'
  | 'energy'
  | 'fuel'
  | 'mass'
  | 'comms'
  | 'survival'

export type Resources = Partial<Record<ResourceKey, number>>

export type ResourceSpec = {
  key: ResourceKey
  start: number
  max: number
  unit: string
  /** For mass, exceeding the max is the problem (not running out). */
  limitIsCeiling?: boolean
}

export type DecisionOption = {
  id: string
  label: string
  description: string
  pros: string
  cons: string
  effects: Resources
  flags?: string[]
}

export type Decision = {
  id: string
  question: string
  hint: string
  conceptId?: string
  options: DecisionOption[]
}

export type LogTone = 'info' | 'success' | 'warning' | 'danger'

export type LogEntry = { tone: LogTone; text: string }

export type SimContext = {
  res: Record<ResourceKey, number>
  specs: ResourceSpec[]
  flags: Set<string>
  log: LogEntry[]
  fatal: string | null
}

export type Phase = {
  id: string
  label: string
  run: (ctx: SimContext) => void
}

export type Objective = {
  id: string
  label: string
  check: (ctx: SimContext) => boolean
  tip: string
}

export type Mission = {
  id: string
  code: string
  title: string
  org: string
  vehicle: string
  location: string
  image: string
  summary: string
  objective: string
  problem: string
  expected: string
  interests: InterestId[]
  difficulty: 'Inicial' | 'Intermedia' | 'Avanzada'
  playable: boolean
  resources: ResourceSpec[]
  decisions: Decision[]
  phases: Phase[]
  objectives: Objective[]
}

export type InterestId =
  | 'campo'
  | 'arte'
  | 'montana'
  | 'deportes'
  | 'negocios'
  | 'tecnologia'
  | 'naturaleza'
  | 'construccion'
  | 'musica'
  | 'ciencia'

export type AvatarBase = 'humano' | 'robot' | 'fantastico'
export type HairStyle = 'ninguno' | 'corto' | 'largo' | 'cresta' | 'rulos'
export type Accessory =
  | 'sombrero'
  | 'boina'
  | 'gorra'
  | 'corbata'
  | 'casco'
  | 'gafas'
  | 'auriculares'
  | 'ninguno'
export type SuitStyle = 'colorido' | 'aerodinamico' | 'elegante' | 'explorador' | 'clasico'

export type AvatarConfig = {
  base: AvatarBase
  skin: string
  hair: HairStyle
  hairColor: string
  outfit: string
  accessory: Accessory
  suit: SuitStyle
  profession: string
}

export type MissionRecord = {
  attempts: number
  bestScore: number
  bestStatus: MissionStatus
}

export type MissionStatus = 'exitosa' | 'parcial' | 'fallida'

export type Profile = {
  id: string
  name: string
  team: string
  country: string | null
  avatar: AvatarConfig
  interests: InterestId[]
  points: number
  xp: number
  medals: string[]
  missions: Record<string, MissionRecord>
  createdAt: number
}

export type SimulationResult = {
  status: MissionStatus
  headline: string
  explanation: string
  phaseLogs: { phaseId: string; label: string; entries: LogEntry[]; snapshot: Record<ResourceKey, number> }[]
  finalResources: Record<ResourceKey, number>
  startResources: Record<ResourceKey, number>
  objectives: { id: string; label: string; done: boolean; tip: string }[]
  fatal: string | null
  score: number
  breakdown: { label: string; value: number }[]
  xp: number
  medals: string[]
  recommendations: string[]
}
