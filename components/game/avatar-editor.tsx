'use client'

import { useState } from 'react'
import { Avatar, SUIT_OPTIONS } from './avatar'
import { ARCHETYPES, HAIR_COLORS, OUTFIT_COLORS, SKIN_COLORS } from '@/lib/game/meta'
import type { Accessory, AvatarBase, AvatarConfig, HairStyle, InterestId } from '@/lib/game/types'
import { cn } from '@/lib/utils'

const BASES: { id: AvatarBase; label: string }[] = [
  { id: 'humano', label: 'Humano' },
  { id: 'robot', label: 'Robot' },
  { id: 'fantastico', label: 'Fantástico' },
]
const HAIRS: { id: HairStyle; label: string }[] = [
  { id: 'corto', label: 'Corto' },
  { id: 'largo', label: 'Largo' },
  { id: 'rulos', label: 'Rulos' },
  { id: 'cresta', label: 'Cresta' },
  { id: 'ninguno', label: 'Sin pelo' },
]
const ACCESSORIES: { id: Accessory; label: string }[] = [
  { id: 'sombrero', label: 'Sombrero' },
  { id: 'boina', label: 'Boina' },
  { id: 'gorra', label: 'Gorra' },
  { id: 'casco', label: 'Casco' },
  { id: 'corbata', label: 'Corbata' },
  { id: 'gafas', label: 'Gafas' },
  { id: 'auriculares', label: 'Auriculares' },
  { id: 'ninguno', label: 'Ninguno' },
]

export function AvatarEditor({
  value,
  onChange,
  onArchetype,
}: {
  value: AvatarConfig
  onChange: (next: AvatarConfig) => void
  onArchetype?: (interests: InterestId[]) => void
}) {
  const [preview, setPreview] = useState<'casual' | 'traje'>('casual')
  const set = <K extends keyof AvatarConfig>(k: K, v: AvatarConfig[K]) => onChange({ ...value, [k]: v })

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-start">
      <div className="flex flex-col items-center gap-3 md:sticky md:top-4 md:w-64">
        <div className="relative flex aspect-square w-48 items-center justify-center rounded-3xl border border-border bg-[radial-gradient(circle_at_50%_40%,var(--color-secondary),var(--color-card))] md:w-64">
          <Avatar config={value} suited={preview === 'traje'} className="animate-float h-44 w-auto md:h-56" />
        </div>
        <div className="flex rounded-full border border-border bg-card p-1 text-sm" role="group" aria-label="Vista previa">
          {(['casual', 'traje'] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={preview === p}
              onClick={() => setPreview(p)}
              className={cn(
                'rounded-full px-4 py-1.5 font-medium transition-colors',
                preview === p ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {p === 'casual' ? 'Estilo propio' : 'Con traje espacial'}
            </button>
          ))}
        </div>
        <label className="flex w-full flex-col gap-1 text-sm">
          <span className="text-muted-foreground">Profesión o personalidad</span>
          <input
            value={value.profession}
            maxLength={24}
            onChange={(e) => set('profession', e.target.value)}
            className="h-10 rounded-lg border border-input bg-background px-3 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      <div className="flex flex-1 flex-col gap-5">
        <Group label="Empezá desde un perfil">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {ARCHETYPES.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  onChange(a.avatar)
                  onArchetype?.(a.interests)
                }}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border p-2 text-xs transition-colors',
                  value.profession === a.avatar.profession
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/60',
                )}
              >
                <Avatar config={a.avatar} className="h-14 w-auto" title={a.label} />
                <span className="font-medium">{a.label}</span>
              </button>
            ))}
          </div>
        </Group>

        <Group label="Tipo">
          <Chips options={BASES} value={value.base} onSelect={(v) => set('base', v)} />
        </Group>
        <Group label="Color de piel / carcasa">
          <Swatches colors={SKIN_COLORS} value={value.skin} onSelect={(c) => set('skin', c)} />
        </Group>
        {value.base !== 'robot' && (
          <Group label="Cabello">
            <Chips options={HAIRS} value={value.hair} onSelect={(v) => set('hair', v)} />
          </Group>
        )}
        <Group label={value.base === 'robot' ? 'Color de luces' : 'Color de cabello'}>
          <Swatches colors={HAIR_COLORS} value={value.hairColor} onSelect={(c) => set('hairColor', c)} />
        </Group>
        <Group label="Vestimenta">
          <Swatches colors={OUTFIT_COLORS} value={value.outfit} onSelect={(c) => set('outfit', c)} />
        </Group>
        <Group label="Accesorio">
          <Chips options={ACCESSORIES} value={value.accessory} onSelect={(v) => set('accessory', v)} />
        </Group>
        <Group label="Traje espacial (equipamiento para salir al espacio)">
          <Chips
            options={SUIT_OPTIONS}
            value={value.suit}
            onSelect={(v) => {
              set('suit', v)
              setPreview('traje')
            }}
          />
        </Group>
      </div>
    </div>
  )
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-medium text-muted-foreground">{label}</legend>
      {children}
    </fieldset>
  )
}

function Chips<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: { id: T; label: string }[]
  value: T
  onSelect: (v: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button
          key={o.id}
          type="button"
          aria-pressed={value === o.id}
          onClick={() => onSelect(o.id)}
          className={cn(
            'rounded-full border px-3 py-1.5 text-sm transition-colors',
            value === o.id
              ? 'border-primary bg-primary text-primary-foreground'
              : 'border-border bg-card hover:border-primary/60',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Swatches({ colors, value, onSelect }: { colors: string[]; value: string; onSelect: (c: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {colors.map((c) => (
        <button
          key={c}
          type="button"
          aria-label={`Color ${c}`}
          aria-pressed={value === c}
          onClick={() => onSelect(c)}
          className={cn(
            'size-9 rounded-full border-2 transition-transform hover:scale-110',
            value === c ? 'border-primary ring-2 ring-primary/40' : 'border-border',
          )}
          style={{ backgroundColor: c }}
        />
      ))}
    </div>
  )
}
