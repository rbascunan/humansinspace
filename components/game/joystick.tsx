'use client'

import { useRef, useState, type RefObject } from 'react'

const RADIUS = 44

export function Joystick({ vector }: { vector: RefObject<{ x: number; y: number }> }) {
  const baseRef = useRef<HTMLDivElement>(null)
  const [knob, setKnob] = useState({ x: 0, y: 0 })
  const active = useRef(false)

  const update = (clientX: number, clientY: number) => {
    const rect = baseRef.current?.getBoundingClientRect()
    if (!rect) return
    let dx = clientX - (rect.left + rect.width / 2)
    let dy = clientY - (rect.top + rect.height / 2)
    const dist = Math.hypot(dx, dy)
    if (dist > RADIUS) {
      dx = (dx / dist) * RADIUS
      dy = (dy / dist) * RADIUS
    }
    setKnob({ x: dx, y: dy })
    vector.current = { x: dx / RADIUS, y: dy / RADIUS }
  }

  const release = () => {
    active.current = false
    setKnob({ x: 0, y: 0 })
    vector.current = { x: 0, y: 0 }
  }

  return (
    <div
      ref={baseRef}
      role="application"
      aria-label="Joystick virtual: arrastrá para mover tu avatar"
      className="relative size-32 touch-none select-none rounded-full border-2 border-primary/40 bg-background/50 backdrop-blur"
      onPointerDown={(e) => {
        active.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        update(e.clientX, e.clientY)
      }}
      onPointerMove={(e) => active.current && update(e.clientX, e.clientY)}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <span
        className="absolute left-1/2 top-1/2 size-14 rounded-full bg-primary/80 shadow-[0_0_20px_var(--color-primary)]"
        style={{ transform: `translate(calc(-50% + ${knob.x}px), calc(-50% + ${knob.y}px))` }}
      />
    </div>
  )
}
