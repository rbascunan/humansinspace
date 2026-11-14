'use client'

import { useEffect, useRef, useState } from 'react'
import { BookOpen, Rocket, Shirt, Trophy, type LucideIcon } from 'lucide-react'
import { Avatar } from './avatar'
import { Joystick } from './joystick'
import { DEMO_PLAYERS } from '@/lib/game/demo'
import type { Profile } from '@/lib/game/types'

export type ViewId = 'universo' | 'misiones' | 'resultados' | 'aprende' | 'hangar'

const WORLD = { w: 1600, h: 1000 }
const SPEED = 260
const SPAWN = { x: 800, y: 560 }

const ZONES: { id: ViewId; label: string; sub: string; x: number; y: number; icon: LucideIcon; color: string }[] = [
  { id: 'misiones', label: 'Centro de Misiones', sub: 'Elegí y jugá misiones', x: 800, y: 300, icon: Rocket, color: 'var(--color-primary)' },
  { id: 'hangar', label: 'Hangar de Avatares', sub: 'Cambiá tu estilo y traje', x: 380, y: 560, icon: Shirt, color: 'var(--color-chart-2)' },
  { id: 'resultados', label: 'Torre de Resultados', sub: 'Ranking y medallas', x: 1220, y: 560, icon: Trophy, color: 'var(--color-accent)' },
  { id: 'aprende', label: 'Biblioteca Espacial', sub: 'Conceptos en simple', x: 800, y: 820, icon: BookOpen, color: 'var(--color-success)' },
]
const ZONE_RADIUS = 90

const NPCS = DEMO_PLAYERS.slice(0, 6).map((p, i) => ({
  ...p,
  cx: 300 + ((i * 237) % 1000),
  cy: 220 + ((i * 173) % 600),
  rx: 60 + (i % 3) * 30,
  ry: 40 + (i % 2) * 30,
  speed: 0.25 + (i % 4) * 0.08,
}))

export function Universe({ profile, onEnter }: { profile: Profile; onEnter: (view: ViewId) => void }) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const worldRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<HTMLDivElement>(null)
  const npcRefs = useRef<(HTMLDivElement | null)[]>([])
  const pos = useRef({ ...SPAWN })
  const keys = useRef(new Set<string>())
  const joy = useRef({ x: 0, y: 0 })
  const [near, setNear] = useState<ViewId | null>(null)
  const nearRef = useRef<ViewId | null>(null)
  const [facing, setFacing] = useState<1 | -1>(1)
  const onEnterRef = useRef(onEnter)
  onEnterRef.current = onEnter

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input,textarea,select')) return
      const k = e.key.toLowerCase()
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(k)) {
        e.preventDefault()
        keys.current.add(k)
      }
      if ((k === 'enter' || k === 'e') && nearRef.current) onEnterRef.current(nearRef.current)
    }
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.toLowerCase())
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)

    let last = performance.now()
    let raf = 0
    let lastFacing = 1
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      const k = keys.current
      let dx = (k.has('arrowright') || k.has('d') ? 1 : 0) - (k.has('arrowleft') || k.has('a') ? 1 : 0)
      let dy = (k.has('arrowdown') || k.has('s') ? 1 : 0) - (k.has('arrowup') || k.has('w') ? 1 : 0)
      dx += joy.current.x
      dy += joy.current.y
      const len = Math.hypot(dx, dy)
      if (len > 1) {
        dx /= len
        dy /= len
      }
      const p = pos.current
      p.x = Math.max(40, Math.min(WORLD.w - 40, p.x + dx * SPEED * dt))
      p.y = Math.max(60, Math.min(WORLD.h - 30, p.y + dy * SPEED * dt))
      if (dx !== 0 && Math.sign(dx) !== lastFacing) {
        lastFacing = Math.sign(dx)
        setFacing(lastFacing as 1 | -1)
      }

      const vp = viewportRef.current
      if (vp && worldRef.current) {
        const vw = vp.clientWidth
        const vh = vp.clientHeight
        const camX = Math.max(Math.min(0, vw - WORLD.w), Math.min(0, vw / 2 - p.x))
        const camY = Math.max(Math.min(0, vh - WORLD.h), Math.min(0, vh / 2 - p.y))
        const offX = vw > WORLD.w ? (vw - WORLD.w) / 2 : camX
        const offY = vh > WORLD.h ? (vh - WORLD.h) / 2 : camY
        worldRef.current.style.transform = `translate3d(${offX}px, ${offY}px, 0)`
      }
      if (playerRef.current) playerRef.current.style.transform = `translate3d(${p.x - 32}px, ${p.y - 86}px, 0)`

      const t = now / 1000
      NPCS.forEach((n, i) => {
        const el = npcRefs.current[i]
        if (!el) return
        const x = n.cx + Math.cos(t * n.speed + i) * n.rx
        const y = n.cy + Math.sin(t * n.speed * 1.3 + i) * n.ry
        el.style.transform = `translate3d(${x - 24}px, ${y - 64}px, 0)`
      })

      const zone = ZONES.find((z) => Math.hypot(z.x - p.x, z.y - p.y) < ZONE_RADIUS)?.id ?? null
      if (zone !== nearRef.current) {
        nearRef.current = zone
        setNear(zone)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  const nearZone = ZONES.find((z) => z.id === near)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Estación Orbital</h1>
          <p className="text-sm text-muted-foreground">
            Mové a {profile.name} hasta una plataforma para entrar.{' '}
            <span className="hidden md:inline">Usá WASD o las flechas y presioná Enter.</span>
            <span className="md:hidden">Usá el joystick.</span>
          </p>
        </div>
        <div className="hidden gap-2 sm:flex">
          {ZONES.map((z) => (
            <button
              key={z.id}
              type="button"
              onClick={() => onEnter(z.id)}
              className="rounded-full border border-border bg-card px-3 py-1.5 text-xs hover:border-primary"
            >
              {z.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={viewportRef}
        className="starfield relative h-[calc(100dvh-13rem)] min-h-[380px] overflow-hidden rounded-3xl border border-border md:h-[calc(100dvh-11rem)]"
      >
        <div ref={worldRef} className="absolute left-0 top-0 will-change-transform" style={{ width: WORLD.w, height: WORLD.h }}>
          <div
            className="absolute rounded-full opacity-80"
            style={{
              left: 1250,
              top: 60,
              width: 260,
              height: 260,
              background: 'radial-gradient(circle at 35% 35%, #fb923c, #c2410c 55%, #431407)',
              boxShadow: '0 0 80px #f9731655',
            }}
            aria-hidden
          />
          <div
            className="absolute rounded-full opacity-80"
            style={{
              left: 60,
              top: 760,
              width: 200,
              height: 200,
              background: 'radial-gradient(circle at 35% 35%, #7dd3fc, #2563eb 55%, #172554)',
              boxShadow: '0 0 80px #3b82f655',
            }}
            aria-hidden
          />
          <div
            className="absolute rounded-full border-[18px] border-secondary/80"
            style={{ left: 380, top: 300, width: 840, height: 520 }}
            aria-hidden
          />
          <div
            className="absolute rounded-full border border-dashed border-primary/20"
            style={{ left: 280, top: 200, width: 1040, height: 720 }}
            aria-hidden
          />

          {ZONES.map((z) => {
            const Icon = z.icon
            const active = near === z.id
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => onEnter(z.id)}
                className="absolute flex flex-col items-center gap-2"
                style={{ left: z.x - ZONE_RADIUS, top: z.y - ZONE_RADIUS, width: ZONE_RADIUS * 2 }}
                aria-label={`Entrar a ${z.label}`}
              >
                <span
                  className="flex items-center justify-center rounded-full border-4 transition-all"
                  style={{
                    width: ZONE_RADIUS * 2,
                    height: ZONE_RADIUS * 2,
                    borderColor: z.color,
                    background: `radial-gradient(circle, color-mix(in oklch, ${z.color} 35%, transparent), transparent 70%)`,
                    boxShadow: active ? `0 0 60px ${z.color}` : `0 0 20px color-mix(in oklch, ${z.color} 40%, transparent)`,
                    transform: active ? 'scale(1.06)' : undefined,
                  }}
                >
                  <Icon className="size-12" style={{ color: z.color }} aria-hidden />
                </span>
                <span className="whitespace-nowrap rounded-full bg-background/80 px-3 py-1 text-sm font-semibold backdrop-blur">
                  {z.label}
                </span>
              </button>
            )
          })}

          {NPCS.map((n, i) => (
            <div
              key={n.id}
              ref={(el) => {
                npcRefs.current[i] = el
              }}
              className="pointer-events-none absolute left-0 top-0 flex flex-col items-center"
              aria-hidden
            >
              <Avatar config={n.avatar} suited={i % 2 === 0} className="h-16 w-12" />
              <span className="whitespace-nowrap rounded bg-background/70 px-1.5 text-[10px] text-muted-foreground">
                {n.name}
              </span>
            </div>
          ))}

          <div ref={playerRef} className="pointer-events-none absolute left-0 top-0 z-10 flex flex-col items-center">
            <span className="mb-1 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {profile.name}
            </span>
            <div style={{ transform: `scaleX(${facing})` }}>
              <Avatar config={profile.avatar} suited className="h-[72px] w-16" title={`Tu avatar: ${profile.name}`} />
            </div>
          </div>
        </div>

        {nearZone && (
          <div className="absolute inset-x-3 top-3 z-20 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur animate-in fade-in slide-in-from-top-2">
            <nearZone.icon className="size-8 shrink-0" style={{ color: nearZone.color }} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{nearZone.label}</p>
              <p className="text-xs text-muted-foreground">{nearZone.sub}</p>
            </div>
            <button
              type="button"
              onClick={() => onEnter(nearZone.id)}
              className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Entrar
            </button>
          </div>
        )}

        <div className="absolute bottom-4 left-4 z-20 md:hidden">
          <Joystick vector={joy} />
        </div>
      </div>
    </div>
  )
}
