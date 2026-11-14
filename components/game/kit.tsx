import Image from 'next/image'
import { cn } from '@/lib/utils'

export type KitPiece =
  | 'alien'
  | 'astronaut-a'
  | 'astronaut-b'
  | 'barrel-tank'
  | 'barrels'
  | 'computer'
  | 'computer-screen'
  | 'corridor'
  | 'crater'
  | 'crystals'
  | 'gate'
  | 'generator'
  | 'generator-large'
  | 'hangar-glass'
  | 'hangar-large'
  | 'hangar-small'
  | 'meteor'
  | 'monorail'
  | 'pipe-ring'
  | 'platform'
  | 'rock'
  | 'rocket-base'
  | 'rocket-fins'
  | 'rocket-fuel'
  | 'rocket-top'
  | 'rover'
  | 'satellite-dish'
  | 'satellite-dish-large'
  | 'ship-cargo'
  | 'ship-miner'
  | 'ship-racer'
  | 'ship-speeder'
  | 'structure'
  | 'supports'
  | 'wireless'
  | `planet-${0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9}`

export function Kit({
  piece,
  size = 64,
  alt = '',
  className,
  style,
}: {
  piece: KitPiece
  size?: number
  alt?: string
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <Image
      src={`/space/${piece}.png`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={size}
      height={size}
      unoptimized
      loading="eager"
      draggable={false}
      className={cn('kit shrink-0', className)}
      style={style}
    />
  )
}

const KEYWORD_PIECES: [RegExp, KitPiece][] = [
  [/antena|estación terrena|radioaficionad|ganancia/i, 'satellite-dish-large'],
  [/radio|transmisor|contacto|comunicaci/i, 'wireless'],
  [/apuntar|giro|barrido|mover/i, 'satellite-dish'],
  [/computadora|reinici|software|diagnóstico|telemetr/i, 'computer-screen'],
  [/datos|ciencia|instrumento/i, 'computer'],
  [/solar|panel/i, 'generator'],
  [/nuclear|rtg|generador/i, 'generator-large'],
  [/batería|energía|potencia/i, 'barrel-tank'],
  [/tonelada|combustible|tanque/i, 'rocket-fuel'],
  [/carga|\(\d+ t\)/i, 'ship-cargo'],
  [/mes(es)?\)|rápida|eficiente|ruta|trayectoria/i, 'ship-speeder'],
  [/refugio|blindaje|radiación/i, 'hangar-glass'],
  [/traje/i, 'astronaut-b'],
  [/sin protección|no mover/i, 'rock'],
  [/rover|vehículo|explor/i, 'rover'],
  [/base|módulo|hábitat|habitat/i, 'hangar-large'],
  [/hielo|agua|regolito|cráter/i, 'crystals'],
]

const FALLBACK_PIECES: KitPiece[] = [
  'satellite-dish',
  'generator',
  'computer',
  'rocket-fuel',
  'rover',
  'hangar-small',
  'ship-cargo',
  'barrel-tank',
  'wireless',
]

export function equipmentPiece(decisionIndex: number, optionIndex: number, text = ''): KitPiece {
  const match = KEYWORD_PIECES.find(([re]) => re.test(text))
  if (match) return match[1]
  return FALLBACK_PIECES[(decisionIndex * 3 + optionIndex) % FALLBACK_PIECES.length]
}
