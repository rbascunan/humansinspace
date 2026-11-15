/**
 * Educational, simplified interpretation of NASA DONKI records for the last 7 days.
 * These rules are HUMANS IN SPACE's own teaching thresholds. They are NOT official
 * NASA thresholds, alerts or mission-safety forecasts.
 *
 * FLR (solar flares) — field `classType` (GOES X-ray class, e.g. "C3.4", "M1.2", "X1.0").
 *   Strongest class in the window: X → complicado · M → medio · A/B/C → bien.
 *   Records whose classType cannot be parsed are ignored; if events exist but none
 *   can be parsed → sin-datos.
 *
 * CME (coronal mass ejections) — `cmeAnalyses[]` entry with `isMostAccurate`, using its
 *   `type` (CCMC speed category: S <500 km/s, C 500–999, O 1000–1999, R 2000–2999,
 *   ER ≥3000) and `enlilList[]` Earth flags (`isEarthGB`, `isEarthMinorImpact`,
 *   `estimatedShockArrivalTime`).
 *   R/ER, or O toward Earth → complicado · O, or C toward Earth → medio · S/C → bien.
 *   CMEs without an analysis are ignored; if none can be evaluated → sin-datos.
 *
 * GST (geomagnetic storms) — highest `allKpIndex[].kpIndex`.
 *   Kp ≥ 7 → complicado · Kp 5–6.9 → medio.
 *   Describes Earth's magnetic environment only, not conditions on a trip to Mars or the Moon.
 *
 * SEP (solar energetic particles) — DONKI records carry no intensity field, so the rule uses
 *   `linkedEvents[].activityID` against the FLR and CME records fetched above.
 *   Linked to an X flare or an R/ER CME → complicado · any other recorded SEP → medio.
 *
 * IPS (interplanetary shocks) — `location` of each shock and `linkedEvents[].activityID`.
 *   Shock at Earth linked to a GST or an O/R/ER CME → complicado · shock at Earth → medio ·
 *   shocks only at other spacecraft (STEREO, etc.) → bien.
 *
 * Empty lists: DONKI only catalogues notable events, so a successful query with no records
 *   means "no notable events catalogued in 7 days" → bien, with that wording in the detail.
 *   A failed query is never shown as bien: it falls back to cache or sin-datos.
 *
 * SUN — synthesis of FLR and CME (the worse of the two available results). It has no
 *   endpoint of its own: six visual indicators come from five independent DONKI endpoints
 *   (FLR, CME, GST, SEP, IPS). If neither FLR nor CME has data → sin-datos.
 */

export type WeatherStatus = 'bien' | 'medio' | 'complicado' | 'sin-datos'
export type IndicatorId = 'sun' | 'flares' | 'cme' | 'storms' | 'particles' | 'shocks'

export type Indicator = {
  id: IndicatorId
  label: string
  name: string
  status: WeatherStatus
  detail: string
}

export type SpaceWeatherPayload = {
  indicators: Indicator[]
  updatedAt: string | null
  stale: boolean
  window: { startDate: string; endDate: string }
}

type Classified = { status: WeatherStatus; detail: string }

type FlrRecord = { flrID?: string; classType?: string | null }
type CmeAnalysis = {
  isMostAccurate?: boolean
  type?: string | null
  speed?: number | null
  enlilList?: { isEarthGB?: boolean; isEarthMinorImpact?: boolean; estimatedShockArrivalTime?: string | null }[] | null
}
type CmeRecord = { activityID?: string; cmeAnalyses?: CmeAnalysis[] | null }
type GstRecord = { gstID?: string; allKpIndex?: { kpIndex?: number | null }[] | null }
type SepRecord = { sepID?: string; linkedEvents?: { activityID?: string }[] | null }
type IpsRecord = { activityID?: string; location?: string | null; linkedEvents?: { activityID?: string }[] | null }

export type DonkiRaw = {
  flr: FlrRecord[] | null
  cme: CmeRecord[] | null
  gst: GstRecord[] | null
  sep: SepRecord[] | null
  ips: IpsRecord[] | null
}

export const EMPTY_RAW: DonkiRaw = { flr: null, cme: null, gst: null, sep: null, ips: null }

const RANK: Record<WeatherStatus, number> = { 'sin-datos': -1, bien: 0, medio: 1, complicado: 2 }
const NO_EVENTS = 'Sin eventos notables en 7 días'

function flareLetter(classType?: string | null) {
  const match = classType?.trim().toUpperCase().match(/^([ABCMX])(\d+(\.\d+)?)?/)
  return match ? { letter: match[1], value: classType!.trim().toUpperCase() } : null
}

const FLARE_ORDER = ['A', 'B', 'C', 'M', 'X']

export function classifyFlares(records: FlrRecord[] | null): Classified {
  if (!records) return { status: 'sin-datos', detail: 'Fuente no disponible' }
  if (records.length === 0) return { status: 'bien', detail: NO_EVENTS }
  const parsed = records.map((r) => flareLetter(r.classType)).filter((p) => p !== null)
  if (parsed.length === 0) return { status: 'sin-datos', detail: 'Clase no informada' }
  const strongest = parsed.reduce((a, b) => {
    const diff = FLARE_ORDER.indexOf(b.letter) - FLARE_ORDER.indexOf(a.letter)
    if (diff !== 0) return diff > 0 ? b : a
    return parseFloat(b.value.slice(1)) > parseFloat(a.value.slice(1)) ? b : a
  })
  const status: WeatherStatus = strongest.letter === 'X' ? 'complicado' : strongest.letter === 'M' ? 'medio' : 'bien'
  return { status, detail: `Máx. clase ${strongest.value}` }
}

const CME_TYPES = ['S', 'C', 'O', 'R', 'ER']

function evaluateCme(record: CmeRecord) {
  const analysis = record.cmeAnalyses?.find((a) => a.isMostAccurate) ?? record.cmeAnalyses?.[0]
  const type = analysis?.type?.toUpperCase()
  if (!analysis || !type || !CME_TYPES.includes(type)) return null
  const towardEarth = (analysis.enlilList ?? []).some(
    (e) => e.isEarthGB || e.isEarthMinorImpact || Boolean(e.estimatedShockArrivalTime),
  )
  let status: WeatherStatus = 'bien'
  if (type === 'R' || type === 'ER' || (type === 'O' && towardEarth)) status = 'complicado'
  else if (type === 'O' || (type === 'C' && towardEarth)) status = 'medio'
  return { status, type, speed: analysis.speed ?? null, towardEarth }
}

export function classifyCme(records: CmeRecord[] | null): Classified {
  if (!records) return { status: 'sin-datos', detail: 'Fuente no disponible' }
  if (records.length === 0) return { status: 'bien', detail: NO_EVENTS }
  const evaluated = records.map(evaluateCme).filter((e) => e !== null)
  if (evaluated.length === 0) return { status: 'sin-datos', detail: 'Sin análisis de velocidad' }
  const worst = evaluated.reduce((a, b) =>
    RANK[b.status] > RANK[a.status] || (RANK[b.status] === RANK[a.status] && (b.speed ?? 0) > (a.speed ?? 0)) ? b : a,
  )
  const speed = worst.speed ? `${Math.round(worst.speed)} km/s` : `tipo ${worst.type}`
  return { status: worst.status, detail: `Máx. ${speed}${worst.towardEarth ? ' · hacia la Tierra' : ''}` }
}

export function classifyStorms(records: GstRecord[] | null): Classified {
  if (!records) return { status: 'sin-datos', detail: 'Fuente no disponible' }
  if (records.length === 0) return { status: 'bien', detail: NO_EVENTS }
  const kps = records.flatMap((r) => (r.allKpIndex ?? []).map((k) => k.kpIndex)).filter((k) => typeof k === 'number')
  if (kps.length === 0) return { status: 'sin-datos', detail: 'Índice Kp no informado' }
  const maxKp = Math.max(...(kps as number[]))
  const status: WeatherStatus = maxKp >= 7 ? 'complicado' : maxKp >= 5 ? 'medio' : 'bien'
  return { status, detail: `Kp máx. ${maxKp.toFixed(1)} (entorno terrestre)` }
}

export function classifyParticles(records: SepRecord[] | null, raw: DonkiRaw): Classified {
  if (!records) return { status: 'sin-datos', detail: 'Fuente no disponible' }
  if (records.length === 0) return { status: 'bien', detail: NO_EVENTS }
  const xFlares = new Set(
    (raw.flr ?? []).filter((f) => flareLetter(f.classType)?.letter === 'X').map((f) => f.flrID),
  )
  const extremeCmes = new Set(
    (raw.cme ?? []).filter((c) => {
      const type = evaluateCme(c)?.type
      return type === 'R' || type === 'ER'
    }).map((c) => c.activityID),
  )
  const severe = records.some((r) =>
    (r.linkedEvents ?? []).some((l) => l.activityID && (xFlares.has(l.activityID) || extremeCmes.has(l.activityID))),
  )
  const count = `${records.length} evento${records.length === 1 ? '' : 's'}`
  return severe
    ? { status: 'complicado', detail: `${count} · ligado a evento intenso` }
    : { status: 'medio', detail: `${count} registrado${records.length === 1 ? '' : 's'}` }
}

export function classifyShocks(records: IpsRecord[] | null, raw: DonkiRaw): Classified {
  if (!records) return { status: 'sin-datos', detail: 'Fuente no disponible' }
  if (records.length === 0) return { status: 'bien', detail: NO_EVENTS }
  const atEarth = records.filter((r) => r.location?.toLowerCase().includes('earth'))
  if (atEarth.length === 0) {
    return { status: 'bien', detail: `${records.length} lejos de la Tierra` }
  }
  const storms = new Set((raw.gst ?? []).map((g) => g.gstID))
  const fastCmes = new Set(
    (raw.cme ?? []).filter((c) => ['O', 'R', 'ER'].includes(evaluateCme(c)?.type ?? '')).map((c) => c.activityID),
  )
  const severe = atEarth.some((r) =>
    (r.linkedEvents ?? []).some((l) => l.activityID && (storms.has(l.activityID) || fastCmes.has(l.activityID))),
  )
  const count = `${atEarth.length} en la Tierra`
  return severe
    ? { status: 'complicado', detail: `${count} · ligado a tormenta/CME` }
    : { status: 'medio', detail: count }
}

export function classifySun(flares: Classified, cme: Classified): Classified {
  const available = [flares, cme].filter((c) => c.status !== 'sin-datos')
  if (available.length === 0) return { status: 'sin-datos', detail: 'Sin FLR ni CME' }
  const worst = available.reduce((a, b) => (RANK[b.status] > RANK[a.status] ? b : a))
  const basis = available.length === 2 ? 'Síntesis FLR + CME' : flares.status === 'sin-datos' ? 'Solo CME' : 'Solo FLR'
  return { status: worst.status, detail: basis }
}

export function buildIndicators(raw: DonkiRaw): Indicator[] {
  const flares = classifyFlares(raw.flr)
  const cme = classifyCme(raw.cme)
  return [
    { id: 'sun', label: 'SUN', name: 'Actividad solar general', ...classifySun(flares, cme) },
    { id: 'flares', label: 'FLARES', name: 'Llamaradas solares', ...flares },
    { id: 'cme', label: 'CME', name: 'Eyecciones de masa coronal', ...cme },
    { id: 'storms', label: 'STORMS', name: 'Tormentas geomagnéticas', ...classifyStorms(raw.gst) },
    { id: 'particles', label: 'PARTICLES', name: 'Partículas solares energéticas', ...classifyParticles(raw.sep, raw) },
    { id: 'shocks', label: 'SHOCKS', name: 'Choques interplanetarios', ...classifyShocks(raw.ips, raw) },
  ]
}
