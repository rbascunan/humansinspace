'use client'

import { useEffect, useRef, useState } from 'react'
import { BookOpen, Rocket, Shirt, Trophy, type LucideIcon } from 'lucide-react'
import { Avatar } from './avatar'
import { Joystick } from './joystick'
import { Kit, type KitPiece } from './kit'
import { DEMO_PLAYERS } from '@/lib/game/demo'
import type { Profile } from '@/lib/game/types'

export type ViewId = 'universo' | 'misiones' | 'resultados' | 'aprende' | 'hangar'

const WORLD = { w: 1600, h: 1000 }
const SPEED = 260
const SPAWN = { x: 800, y: 560 }

const ZONES: {
  id: ViewId
  label: string
  sub: string
  x: number
  y: number
  icon: LucideIcon
  color: string
  build: [KitPiece, KitPiece, KitPiece]
}[] = [
  { id: 'misiones', label: 'Centro de Misiones', sub: 'Elegí y jugá misiones', x: 800, y: 330, icon: Rocket, color: 'var(--color-primary)', build: ['robot-arm-b', 'machine-fortified', 'crane'] },
  { id: 'hangar', label: 'Hangar de Avatares', sub: 'Cambiá tu estilo y traje', x: 360, y: 580, icon: Shirt, color: 'var(--color-chart-2)', build: ['box-large', 'structure-doorway-wide', 'lever-double'] },
  { id: 'resultados', label: 'Torre de Resultados', sub: 'Ranking y medallas', x: 1240, y: 580, icon: Trophy, color: 'var(--color-accent)', build: ['screen-panel-wide', 'structure-yellow-tall', 'screen-wide'] },
  { id: 'aprende', label: 'Biblioteca Espacial', sub: 'Conceptos en simple', x: 800, y: 850, icon: BookOpen, color: 'var(--color-success)', build: ['screen-small', 'structure-window', 'scanner-high'] },
]
const ZONE_RADIUS = 95

const DECOR: { piece: KitPiece; x: number; y: number; size: number }[] = [
  { piece: 'pipe-glass-large-curve', x: 150, y: 190, size: 110 },
  { piece: 'cog-a', x: 580, y: 170, size: 64 },
  { piece: 'box-large', x: 1070, y: 210, size: 80 },
  { piece: 'piston-round', x: 480, y: 770, size: 80 },
  { piece: 'pipe-large-bend', x: 1090, y: 800, size: 100 },
  { piece: 'crane-magnet', x: 1410, y: 390, size: 110 },
  { piece: 'oopi', x: 600, y: 630, size: 48 },
]

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
          <p className="hud-label">Sector 01 · Mundo abierto</p>
          <h1 className="text-2xl font-bold uppercase tracking-wide md:text-3xl">Estación Orbital</h1>
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
              className="hud flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition-colors hover:text-primary"
              style={{ ['--cut' as string]: '6px' }}
            >
              <z.icon className="size-3.5" style={{ color: z.color }} aria-hidden />
              {z.label}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={viewportRef}
        className="starfield relative h-[calc(100dvh-14rem)] min-h-[380px] overflow-hidden rounded-xl border-2 border-border md:h-[calc(100dvh-12rem)]"
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
            }}
            aria-hidden
          />
          <div
            className="deck absolute rounded-[48px] border-2 border-border/80"
            style={{ left: 90, top: 110, width: 1420, height: 840 }}
            aria-hidden
          />
          <div
            className="absolute rounded-full border-[14px] border-secondary/70"
            style={{ left: 380, top: 350, width: 840, height: 480 }}
            aria-hidden
          />
          <div
            className="absolute rounded-full border-2 border-dashed border-primary/30"
            style={{ left: 410, top: 380, width: 780, height: 420 }}
            aria-hidden
          />

          {DECOR.map((d, i) => (
            <Kit
              key={i}
              piece={d.piece}
              size={d.size}
              className="pointer-events-none absolute"
              style={{ left: d.x - d.size / 2, top: d.y - d.size / 2 }}
            />
          ))}

          {ZONES.map((z) => {
            const Icon = z.icon
            const active = near === z.id
            return (
              <button
                key={z.id}
                type="button"
                onClick={() => onEnter(z.id)}
                className="group absolute flex flex-col items-center"
                style={{ left: z.x - 130, top: z.y - 170, width: 260 }}
                aria-label={`Entrar a ${z.label}`}
              >
                <span className="relative z-[1] flex h-[150px] items-end justify-center">
                  <Kit piece={z.build[0]} size={92} className="-mr-6 mb-2" />
                  <Kit
                    piece={z.build[1]}
                    size={140}
                    className="transition-transform duration-300 group-hover:-translate-y-1"
                    style={{ transform: active ? 'translateY(-6px)' : undefined }}
                  />
                  <Kit piece={z.build[2]} size={92} className="-ml-6 mb-2" />
                </span>
                <span
                  className="-mt-12 h-[100px] w-[240px] rounded-[50%] border-[3px] transition-[border-width]"
                  style={{
                    borderColor: z.color,
                    borderWidth: active ? 5 : 3,
                    background: `radial-gradient(ellipse, color-mix(in oklch, ${z.color} ${active ? 60 : 32}%, transparent), transparent 70%)`,
                  }}
                  aria-hidden
                />
                <span
                  className="hud mt-2 flex items-center gap-2 whitespace-nowrap px-4 py-1.5 text-sm font-bold"
                  style={{ ['--cut' as string]: '8px' }}
                >
                  <Icon className="size-4" style={{ color: z.color }} aria-hidden />
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
              className="pointer-events-none absolute left-0 top-0 flex flex-col items-center will-change-transform"
              aria-hidden
            >
              <Avatar config={n.avatar} suited={i % 2 === 0} className="h-16 w-12" />
              <span className="whitespace-nowrap rounded bg-background/70 px-1.5 text-[10px] text-muted-foreground">
                {n.name}
              </span>
            </div>
          ))}

          <div ref={playerRef} className="pointer-events-none absolute left-0 top-0 z-10 flex flex-col items-center will-change-transform">
            <span className="mb-1 whitespace-nowrap rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
              {profile.name}
            </span>
            <div style={{ transform: `scaleX(${facing})` }}>
              <Avatar config={profile.avatar} suited className="h-[72px] w-16" title={`Tu avatar: ${profile.name}`} />
            </div>
          </div>
        </div>

        {nearZone && (
          <div className="hud absolute inset-x-3 top-3 z-20 mx-auto flex max-w-sm items-center gap-3 p-3 shadow-xl animate-in fade-in slide-in-from-top-2">
            <span className="slot flex size-12 shrink-0 items-center justify-center rounded-md">
              <Kit piece={nearZone.build[1]} size={44} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="hud-label">Zona detectada</p>
              <p className="font-bold">{nearZone.label}</p>
              <p className="text-xs text-muted-foreground">{nearZone.sub}</p>
            </div>
            <button type="button" onClick={() => onEnter(nearZone.id)} className="btn-game h-10 px-4 text-sm">
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
