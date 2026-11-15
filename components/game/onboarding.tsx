'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, ArrowRight, LoaderCircle, LogIn, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar } from './avatar'
import { AvatarEditor } from './avatar-editor'
import { InterestPicker } from './interest-picker'
import { Flag } from './flag'
import { HomeStats } from './home-stats'
import { HeroSpaceScene } from './hero-space-scene'
import { ARCHETYPES } from '@/lib/game/meta'
import { COUNTRIES } from '@/lib/game/countries'
import { signIn } from '@/lib/game/store'
import { signUpPlayer } from '@/app/actions'
import type { AvatarConfig, InterestId } from '@/lib/game/types'
import { CreditsFooter } from './credits-footer'

const STEPS = ['Ingresar', 'Tu avatar', 'Tus intereses'] as const
const FIELD =
  'h-12 rounded-xl border border-input bg-card px-4 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring'

export function Onboarding() {
  const [step, setStep] = useState(0)
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [name, setName] = useState('')
  const [team, setTeam] = useState('')
  const [country, setCountry] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [avatar, setAvatar] = useState<AvatarConfig>(ARCHETYPES[1].avatar)
  const [interests, setInterests] = useState<InterestId[]>(ARCHETYPES[1].interests)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const finish = async () => {
    setPending(true)
    setError(null)
    const res = await signUpPlayer({ email, password, name, team, country, avatar, interests })
    if ('error' in res) {
      setError(res.error)
      setPending(false)
      return
    }
    const loginError = await signIn(email, password)
    if (loginError) {
      setError(loginError)
      setPending(false)
    }
  }

  const login = async () => {
    setPending(true)
    setError(null)
    const loginError = await signIn(email, password)
    if (loginError) {
      setError(loginError)
      setPending(false)
    }
  }

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
              <div className="flex w-full max-w-md flex-col gap-3 self-center md:self-start">
                <div className="flex rounded-full border border-border bg-card p-1 text-sm" role="tablist">
                  {(
                    [
                      ['signup', 'Crear cuenta'],
                      ['login', 'Ya tengo cuenta'],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      role="tab"
                      aria-selected={mode === id}
                      onClick={() => {
                        setMode(id)
                        setError(null)
                      }}
                      className={
                        mode === id
                          ? 'flex-1 rounded-full bg-primary px-4 py-1.5 font-semibold text-primary-foreground'
                          : 'flex-1 rounded-full px-4 py-1.5 text-muted-foreground hover:text-foreground'
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <form
                  className="flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (mode === 'login') login()
                    else {
                      setError(null)
                      setStep(1)
                    }
                  }}
                >
                  {mode === 'signup' && (
                    <>
                      <label className="flex flex-col gap-1 text-left text-sm">
                        <span className="text-muted-foreground">Tu nombre de jugador</span>
                        <input
                          required
                          maxLength={24}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Ej: Luz Pampa"
                          className={FIELD}
                        />
                      </label>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <label className="flex flex-col gap-1 text-left text-sm">
                          <span className="text-muted-foreground">Equipo (opcional)</span>
                          <input
                            maxLength={24}
                            value={team}
                            onChange={(e) => setTeam(e.target.value)}
                            placeholder="Ej: Andes Rockets"
                            className={FIELD}
                          />
                        </label>
                        <label className="flex flex-col gap-1 text-left text-sm">
                          <span className="flex items-center gap-2 text-muted-foreground">
                            País <Flag code={country} />
                          </span>
                          <select
                            required
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className={FIELD}
                          >
                            <option value="" disabled>
                              Elegí tu país
                            </option>
                            {COUNTRIES.map((c) => (
                              <option key={c.code} value={c.code}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>
                    </>
                  )}
                  <label className="flex flex-col gap-1 text-left text-sm">
                    <span className="text-muted-foreground">Email</span>
                    <input
                      required
                      type="email"
                      autoComplete="email"
                      maxLength={120}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vos@ejemplo.com"
                      className={FIELD}
                    />
                  </label>
                  <label className="flex flex-col gap-1 text-left text-sm">
                    <span className="text-muted-foreground">Contraseña</span>
                    <input
                      required
                      type="password"
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                      minLength={mode === 'signup' ? 8 : undefined}
                      maxLength={72}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={mode === 'signup' ? 'Mínimo 8 caracteres' : 'Tu contraseña'}
                      className={FIELD}
                    />
                  </label>
                  {error && step === 0 && (
                    <p role="alert" className="text-left text-sm text-destructive">
                      {error}
                    </p>
                  )}
                  <Button type="submit" disabled={pending} className="h-12 rounded-xl text-base font-semibold">
                    {mode === 'login' ? (
                      <>
                        {pending ? <LoaderCircle className="animate-spin" /> : <LogIn />} Ingresar
                      </>
                    ) : (
                      <>
                        Crear mi avatar <ArrowRight />
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Tu progreso y tus puntos se guardan en tu cuenta y suman al ranking global.
                  </p>
                </form>
              </div>
            </div>
            <div className="flex w-full flex-col items-center gap-5 md:w-auto md:max-w-md md:flex-1">
              <HeroSpaceScene>
                {ARCHETYPES.slice(0, 3).map((a, i) => (
                  <Avatar
                    key={a.id}
                    config={a.avatar}
                    suited={i === 1}
                    className="animate-float h-32 w-auto md:h-40"
                    title={a.label}
                  />
                ))}
              </HeroSpaceScene>
              <HomeStats />
            </div>
          </section>
        )}

        {step === 0 && <CreditsFooter className="mt-auto" />}

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
              <div className="flex items-center gap-3">
                {error && (
                  <p role="alert" className="max-w-xs text-right text-sm text-destructive">
                    {error}
                  </p>
                )}
                <Button className="h-11 px-5 font-semibold" disabled={!interests.length || pending} onClick={finish}>
                  {pending ? <LoaderCircle className="animate-spin" /> : <Rocket />} Despegar
                </Button>
              </div>
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
      <Image
        src="/images/his-logo.png"
        alt=""
        width={44}
        height={44}
        priority
        className="size-11 rounded-full object-cover"
      />
      <span className="text-lg font-bold leading-none tracking-tight">
        HUMANS <span className="text-primary">IN SPACE</span>
      </span>
    </div>
  )
}
