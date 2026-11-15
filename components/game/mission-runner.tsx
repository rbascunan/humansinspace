'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ArrowLeft, MapPin, Rocket, Target, TriangleAlert, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ResourcePanel } from './resource-panel'
import { MissionDesign } from './mission-design'
import { MissionSimulation } from './mission-simulation'
import { MissionResult } from './mission-result'
import { planResources, simulate, type Choices } from '@/lib/game/simulate'
import { getAccessToken, refreshProgress } from '@/lib/game/store'
import { submitMissionResult } from '@/app/actions'
import type { Mission, Profile, SimulationResult } from '@/lib/game/types'

type Stage = 'plan' | 'design' | 'simulate' | 'result'
const STAGES: { id: Stage; label: string }[] = [
  { id: 'plan', label: 'Planificar' },
  { id: 'design', label: 'Decidir' },
  { id: 'simulate', label: 'Simular' },
  { id: 'result', label: 'Evaluar' },
]

export function MissionRunner({
  mission,
  profile,
  onExit,
  onResults,
}: {
  mission: Mission
  profile: Profile
  onExit: () => void
  onResults: () => void
}) {
  const [stage, setStage] = useState<Stage>('plan')
  const [choices, setChoices] = useState<Choices>({})
  const [result, setResult] = useState<SimulationResult | null>(null)
  const [pointsGained, setPointsGained] = useState(0)
  const startValues = useMemo(() => planResources(mission, {}).res, [mission])

  const launch = () => {
    setResult(simulate(mission, choices, profile))
    setStage('simulate')
  }

  const finishSimulation = async () => {
    if (!result) return
    setStage('result')
    setPointsGained(0)
    const token = await getAccessToken()
    if (!token) return
    const res = await submitMissionResult(token, mission.id, choices)
    if ('error' in res) {
      console.error('[mission] could not save result:', res.error)
      return
    }
    setPointsGained(res.pointsAwarded)
    refreshProgress()
  }

  const stageIndex = STAGES.findIndex((s) => s.id === stage)

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" onClick={onExit} className="h-9">
          <ArrowLeft /> Misiones
        </Button>
        <ol className="flex items-center gap-1 text-xs" aria-label="Etapas de la misión">
          {STAGES.map((s, i) => (
            <li key={s.id} className="flex items-center gap-1" aria-current={i === stageIndex ? 'step' : undefined}>
              <span
                className={
                  i === stageIndex
                    ? 'rounded-full bg-primary px-2.5 py-1 font-semibold text-primary-foreground'
                    : i < stageIndex
                      ? 'rounded-full bg-primary/20 px-2.5 py-1 text-primary'
                      : 'rounded-full bg-muted px-2.5 py-1 text-muted-foreground'
                }
              >
                <span className="font-mono">{String.fromCharCode(65 + i)}</span>
                <span className="hidden sm:inline"> · {s.label}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {stage === 'plan' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
          <div className="flex flex-col gap-5">
            <div className="relative overflow-hidden rounded-3xl border border-border">
              <Image
                src={mission.image}
                alt={`Ilustración de la misión ${mission.title}`}
                width={1200}
                height={675}
                className="aspect-[16/8] w-full object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-5">
                <span className="font-mono text-xs uppercase tracking-widest text-accent">{mission.code}</span>
                <h2 className="text-balance text-2xl font-bold md:text-4xl">{mission.title}</h2>
                <div className="flex items-center gap-3">
                  <Image
                    src={mission.logo}
                    alt={`Logo ${mission.org}`}
                    width={140}
                    height={36}
                    className="h-7 w-auto max-w-32 object-contain"
                  />
                  <p className="text-sm text-muted-foreground">{mission.org}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Info icon={Target} title="Qué tenés que lograr" text={mission.objective} />
              <Info icon={MapPin} title="Dónde" text={`${mission.location} · ${mission.vehicle}`} />
              <Info icon={TriangleAlert} title="El problema" text={mission.problem} tone="warning" />
              <Info icon={Wrench} title="Resultado esperado" text={mission.expected} />
            </div>
            <p className="text-xs text-muted-foreground">
              Simulación educativa inspirada en un proyecto real. La falla es ficticia y no implica asociación oficial
              con la institución.
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <ResourcePanel specs={mission.resources} values={startValues} title="Recursos iniciales" />
            <Button className="h-12 text-base font-semibold" onClick={() => setStage('design')}>
              <Rocket /> Diseñar la misión
            </Button>
          </div>
        </div>
      )}

      {stage === 'design' && (
        <MissionDesign mission={mission} choices={choices} onChange={setChoices} onLaunch={launch} />
      )}

      {stage === 'simulate' && result && (
        <MissionSimulation mission={mission} result={result} onDone={finishSimulation} />
      )}

      {stage === 'result' && result && (
        <MissionResult
          mission={mission}
          result={result}
          pointsGained={pointsGained}
          onRetry={() => {
            setResult(null)
            setStage('design')
          }}
          onResults={onResults}
          onExit={onExit}
        />
      )}
    </div>
  )
}

function Info({
  icon: Icon,
  title,
  text,
  tone,
}: {
  icon: typeof Target
  title: string
  text: string
  tone?: 'warning'
}) {
  return (
    <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
      <Icon className={tone === 'warning' ? 'mt-0.5 size-5 shrink-0 text-warning' : 'mt-0.5 size-5 shrink-0 text-primary'} aria-hidden />
      <div>
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-pretty text-sm text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}
