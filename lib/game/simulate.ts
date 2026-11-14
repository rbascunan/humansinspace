import type {
  Mission,
  Profile,
  ResourceKey,
  SimContext,
  SimulationResult,
} from './types'

const ALL_KEYS: ResourceKey[] = ['budget', 'energy', 'fuel', 'mass', 'comms', 'survival']

export type Choices = Record<string, string>

export function planResources(mission: Mission, choices: Choices) {
  const res = Object.fromEntries(ALL_KEYS.map((k) => [k, 0])) as Record<ResourceKey, number>
  for (const spec of mission.resources) res[spec.key] = spec.start
  const flags = new Set<string>()
  for (const decision of mission.decisions) {
    const option = decision.options.find((o) => o.id === choices[decision.id])
    if (!option) continue
    for (const [k, v] of Object.entries(option.effects)) {
      res[k as ResourceKey] += v ?? 0
    }
    option.flags?.forEach((f) => flags.add(f))
  }
  for (const spec of mission.resources) {
    if (!spec.limitIsCeiling && spec.key !== 'budget') {
      res[spec.key] = Math.min(res[spec.key], spec.max)
    }
  }
  return { res, flags }
}

export function planIssues(mission: Mission, choices: Choices) {
  const { res } = planResources(mission, choices)
  const blocking: string[] = []
  const warnings: string[] = []
  const missing = mission.decisions.filter((d) => !choices[d.id])
  if (missing.length) blocking.push(`Faltan ${missing.length} decisiones por tomar.`)
  if (res.budget < 0) blocking.push(`Presupuesto excedido en ${Math.abs(res.budget)}. Elegí opciones más económicas.`)
  for (const spec of mission.resources) {
    if (spec.limitIsCeiling && res[spec.key] > spec.max) {
      warnings.push(`La carga (${res[spec.key]} ${spec.unit}) supera el límite de ${spec.max} ${spec.unit}.`)
    }
    if (spec.key === 'energy' && res.energy <= 20) {
      warnings.push('Energía muy baja antes de empezar.')
    }
  }
  return { blocking, warnings }
}

export function simulate(mission: Mission, choices: Choices, profile: Profile | null): SimulationResult {
  const { res, flags } = planResources(mission, choices)
  const start = { ...res }
  const ctx: SimContext = { res, specs: mission.resources, flags, log: [], fatal: null }
  const phaseLogs: SimulationResult['phaseLogs'] = []

  for (const phase of mission.phases) {
    const before = ctx.log.length
    phase.run(ctx)
    phaseLogs.push({
      phaseId: phase.id,
      label: phase.label,
      entries: ctx.log.slice(before),
      snapshot: { ...ctx.res },
    })
    if (ctx.fatal) break
  }

  const objectives = mission.objectives.map((o) => ({
    id: o.id,
    label: o.label,
    done: !ctx.fatal || o.id === 'contact' || o.id === 'reached' ? o.check(ctx) : false,
    tip: o.tip,
  }))
  const doneCount = objectives.filter((o) => o.done).length
  const allDone = doneCount === objectives.length

  const status: SimulationResult['status'] = ctx.fatal
    ? 'fallida'
    : allDone
      ? 'exitosa'
      : doneCount > 0
        ? 'parcial'
        : 'fallida'

  const dangers = ctx.log.filter((l) => l.tone === 'danger').length
  const warnings = ctx.log.filter((l) => l.tone === 'warning').length

  const consumable = mission.resources.filter((s) => !s.limitIsCeiling && s.key !== 'comms' && s.key !== 'survival')
  const efficiency = consumable.length
    ? consumable.reduce((acc, s) => {
        const base = s.key === 'budget' ? s.max : Math.max(start[s.key], 1)
        return acc + Math.max(0, Math.min(1, ctx.res[s.key] / base))
      }, 0) / consumable.length
    : 0

  const safetySpec = mission.resources.find((s) => s.key === 'survival') ?? mission.resources.find((s) => s.key === 'comms')
  const safety = safetySpec ? Math.max(0, Math.min(1, ctx.res[safetySpec.key] / safetySpec.max)) : 0

  const objectivePts = Math.round((1000 * doneCount) / Math.max(objectives.length, 1))
  const efficiencyPts = status === 'fallida' ? 0 : Math.round(efficiency * 300)
  const safetyPts = status === 'fallida' ? 0 : Math.round(safety * 200)
  const penalty = dangers * 60 + warnings * 20

  const score = Math.max(0, objectivePts + efficiencyPts + safetyPts - penalty)
  const xp = Math.round(score * 0.6) + 50

  const prevCompleted = profile
    ? Object.values(profile.missions).some((m) => m.bestStatus !== 'fallida')
    : false
  const medals: string[] = []
  if (status !== 'fallida' && !prevCompleted) medals.push('explorador')
  if (allDone && dangers === 0 && warnings === 0) medals.push('perfecta')
  if (status !== 'fallida' && efficiency >= 0.45) medals.push('recursos')
  if (status === 'exitosa' && dangers === 0) medals.push('estratega')
  if (mission.id === 'usat1' && status === 'exitosa') medals.push('rescatista')
  if (mission.id === 'mars' && flags.has('landed')) medals.push('pionero')

  const done = objectives.filter((o) => o.done).map((o) => o.label.toLowerCase())
  const pending = objectives.filter((o) => !o.done)

  const headline =
    status === 'exitosa'
      ? '¡Misión exitosa!'
      : status === 'parcial'
        ? '¡Misión parcialmente exitosa!'
        : 'Misión fallida'

  let explanation = ''
  if (ctx.fatal) explanation = ctx.fatal + ' '
  if (done.length) explanation += `Lograste ${joinEs(done)}. `
  if (pending.length && !ctx.fatal)
    explanation += `Quedó pendiente: ${joinEs(pending.map((p) => p.label.toLowerCase()))}.`

  const recommendations = pending.map((p) => p.tip)
  if (dangers > 0) recommendations.push('Revisá los eventos en rojo: cada uno muestra una decisión que se puede mejorar.')
  if (status === 'exitosa' && efficiency < 0.45)
    recommendations.push('¡Lo lograste! Probá de nuevo gastando menos recursos para sumar más puntos.')

  return {
    status,
    headline,
    explanation: explanation.trim(),
    phaseLogs,
    finalResources: { ...ctx.res },
    startResources: start,
    objectives,
    fatal: ctx.fatal,
    score,
    breakdown: [
      { label: 'Objetivos cumplidos', value: objectivePts },
      { label: 'Uso eficiente de recursos', value: efficiencyPts },
      { label: 'Seguridad de la misión', value: safetyPts },
      { label: 'Problemas durante la misión', value: -penalty },
    ],
    xp,
    medals,
    recommendations,
  }
}

function joinEs(items: string[]) {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} y ${items[items.length - 1]}`
}
