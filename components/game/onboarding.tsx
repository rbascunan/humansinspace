'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from './avatar'
import { AvatarEditor } from './avatar-editor'
import { InterestPicker } from './interest-picker'
import { ARCHETYPES } from '@/lib/game/meta'
import { createProfile } from '@/lib/game/store'
import type { AvatarConfig, InterestId } from '@/lib/game/types'

const STEPS = ['Ingresar', 'Tu avatar', 'Tus intereses'] as const

export function Onboarding() {
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [team, setTeam] = useState('')
  const [avatar, setAvatar] = useState<AvatarConfig>(ARCHETYPES[1].avatar)
  const [interests, setInterests] = useState<InterestId[]>(ARCHETYPES[1].interests)

  const finish = () => createProfile({ name, team, avatar, interests })

  return (
    <main className="starfield min-h-dvh">
      <div className="mx-auto flex min-h-dvh max-w-5xl flex-col gap-6 px-4 py-6 md:py-10">
        <header className="flex items-center justify-between gap-4">
          <Logo />
          <ol className="flex items-center gap-2 text-xs" aria-label="Pasos">
            {STEPS.map((s, i) => (
              <li
                key={s}
                aria-current={i === step ? 'step' : undefined}
                className={
                  i === step
                    ? 'rounded-full bg-primary px-3 py-1 font-semibold text-primary-foreground'
                    : i < step
                      ? 'rounded-full bg-primary/20 px-3 py-1 text-primary'
                      : 'hidden rounded-full bg-muted px-3 py-1 text-muted-foreground sm:block'
                }
              >
                {i + 1}. {s}
              </li>
            ))}
          </ol>
        </header>

        {step === 0 && (
          <section className="flex flex-1 flex-col items-center justify-center gap-8 text-center md:flex-row md:text-left">
            <div className="flex flex-1 flex-col gap-5">
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-accent">NASA Space Apps Challenge</p>
              <h1 className="text-balance text-4xl font-bold leading-tight md:text-6xl">
                Tus intereses. Tu universo. <span className="text-primary">Tus misiones.</span>
              </h1>
              <p className="text-pretty text-lg text-muted-foreground">
                Un universo. Millones de personalidades. Un futuro compartido. Diseñá misiones espaciales reales,
                tomá decisiones de ingeniería y descubrí cómo cada elección cambia el resultado.
              </p>
              <form
                className="flex w-full max-w-md flex-col gap-3 self-center md:self-start"
                onSubmit={(e) => {
                  e.preventDefault()
                  setStep(1)
                }}
              >
                <label className="flex flex-col gap-1 text-left text-sm">
                  <span className="text-muted-foreground">Tu nombre de jugador</span>
                  <input
                    required
                    autoFocus
                    maxLength={24}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Luz Pampa"
                    className="h-12 rounded-xl border border-input bg-card px-4 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
                <label className="flex flex-col gap-1 text-left text-sm">
                  <span className="text-muted-foreground">Equipo (opcional)</span>
                  <input
                    maxLength={24}
                    value={team}
                    onChange={(e) => setTeam(e.target.value)}
                    placeholder="Ej: Andes Rockets"
                    className="h-12 rounded-xl border border-input bg-card px-4 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </label>
                <Button type="submit" className="h-12 rounded-xl text-base font-semibold">
                  Entrar al universo <ArrowRight />
                </Button>
                <p className="text-xs text-muted-foreground">
                  Sin contraseña ni registro: tu progreso se guarda en este dispositivo.
                </p>
              </form>
            </div>
            <div className="flex items-end justify-center gap-2">
              {ARCHETYPES.slice(0, 3).map((a, i) => (
                <Avatar
                  key={a.id}
                  config={a.avatar}
                  suited={i === 1}
                  className="animate-float h-32 w-auto md:h-48"
                  title={a.label}
                />
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">Creá un avatar con tu personalidad</h2>
              <p className="text-muted-foreground">
                No todos somos astronautas. Sé quien quieras ser: tu traje espacial también lleva tu estilo.
              </p>
            </div>
            <AvatarEditor value={avatar} onChange={setAvatar} onArchetype={setInterests} />
          </section>
        )}

        {step === 2 && (
          <section className="flex flex-col gap-6">
            <div>
              <h2 className="text-2xl font-bold md:text-3xl">¿Qué te gusta?</h2>
              <p className="text-muted-foreground">
                Elegí uno o varios intereses. Te recomendaremos misiones, pero podés jugar cualquiera.
              </p>
            </div>
            <InterestPicker value={interests} onChange={setInterests} />
          </section>
        )}

        {step > 0 && (
          <div className="sticky bottom-0 -mx-4 mt-auto flex items-center justify-between gap-3 border-t border-border bg-background/90 px-4 py-3 backdrop-blur">
            <Button variant="ghost" className="h-11" onClick={() => setStep(step - 1)}>
              <ArrowLeft /> Volver
            </Button>
            {step === 1 ? (
              <Button className="h-11 px-5 font-semibold" onClick={() => setStep(2)}>
                Siguiente <ArrowRight />
              </Button>
            ) : (
              <Button className="h-11 px-5 font-semibold" disabled={!interests.length} onClick={finish}>
                <Rocket /> Despegar
              </Button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}

export function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Rocket className="size-5" aria-hidden />
      </span>
      <span className="text-lg font-bold leading-none tracking-tight">
        HUMANS <span className="text-primary">IN SPACE</span>
      </span>
    </div>
  )
}
