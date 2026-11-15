import { NextResponse } from 'next/server'
import { buildIndicators, type DonkiRaw, type SpaceWeatherPayload } from '@/lib/space-weather/classify'

const DONKI_BASE = 'https://api.nasa.gov/DONKI'
const ENDPOINTS = { flr: 'FLR', cme: 'CME', gst: 'GST', sep: 'SEP' } as const
type Key = keyof typeof ENDPOINTS

const FRESH_MS = 30 * 60 * 1000
const TIMEOUT_MS = 10_000

type CachedSource = { data: unknown[]; fetchedAt: number }
const sourceCache: Partial<Record<Key, CachedSource>> = {}
let inflight: Promise<SpaceWeatherPayload> | null = null
let lastPayload: { payload: SpaceWeatherPayload; builtAt: number } | null = null

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

async function fetchSource(key: Key, startDate: string, endDate: string, apiKey: string) {
  const url = `${DONKI_BASE}/${ENDPOINTS[key]}?startDate=${startDate}&endDate=${endDate}&api_key=${apiKey}`
  const res = await fetch(url, { cache: 'no-store', signal: AbortSignal.timeout(TIMEOUT_MS) })
  if (!res.ok) throw new Error(`${ENDPOINTS[key]} HTTP ${res.status}`)
  const body: unknown = await res.json()
  if (!Array.isArray(body)) throw new Error(`${ENDPOINTS[key]} unexpected body`)
  return body
}

async function buildPayload(): Promise<SpaceWeatherPayload> {
  // DEMO_KEY works with much lower rate limits; configure NASA_API_KEY for production.
  const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY'
  const end = new Date()
  const start = new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000)
  const window = { startDate: isoDay(start), endDate: isoDay(end) }

  const keys = Object.keys(ENDPOINTS) as Key[]
  const results = await Promise.allSettled(keys.map((k) => fetchSource(k, window.startDate, window.endDate, apiKey)))

  const raw: DonkiRaw = { flr: null, cme: null, gst: null, sep: null }
  let stale = false
  const freshTimes: number[] = []
  const now = Date.now()

  results.forEach((result, i) => {
    const key = keys[i]
    if (result.status === 'fulfilled') {
      sourceCache[key] = { data: result.value, fetchedAt: now }
      raw[key] = result.value as never
      freshTimes.push(now)
    } else {
      console.error(`[space-weather] ${ENDPOINTS[key]} failed:`, result.reason)
      const cached = sourceCache[key]
      if (cached) {
        raw[key] = cached.data as never
        freshTimes.push(cached.fetchedAt)
        stale = true
      }
    }
  })

  return {
    indicators: buildIndicators(raw),
    updatedAt: freshTimes.length ? new Date(Math.min(...freshTimes)).toISOString() : null,
    stale,
    window,
  }
}

export async function GET() {
  if (!lastPayload || Date.now() - lastPayload.builtAt > FRESH_MS) {
    inflight ??= buildPayload().finally(() => {
      inflight = null
    })
    try {
      const payload = await inflight
      lastPayload = { payload, builtAt: Date.now() }
    } catch (error) {
      console.error('[space-weather] build failed:', error)
      if (lastPayload) {
        lastPayload = { payload: { ...lastPayload.payload, stale: true }, builtAt: lastPayload.builtAt }
      }
    }
  }

  const payload: SpaceWeatherPayload = lastPayload?.payload ?? {
    indicators: buildIndicators({ flr: null, cme: null, gst: null, sep: null }),
    updatedAt: null,
    stale: false,
    window: { startDate: '', endDate: '' },
  }

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600' },
  })
}
