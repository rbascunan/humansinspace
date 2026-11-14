import Image from 'next/image'
import { cn } from '@/lib/utils'

export type KitPiece =
  | 'structure-tall'
  | 'structure-yellow-tall'
  | 'structure-window'
  | 'structure-doorway-wide'
  | 'machine'
  | 'machine-window'
  | 'machine-fortified'
  | 'robot-arm-a'
  | 'robot-arm-b'
  | 'crane'
  | 'crane-magnet'
  | 'screen-wide'
  | 'screen-panel-wide'
  | 'screen-small'
  | 'scanner-high'
  | 'cog-a'
  | 'cog-b'
  | 'pipe-glass-large-curve'
  | 'pipe-large-bend'
  | 'hopper-high-round'
  | 'box-large'
  | 'box-small'
  | 'lever-double'
  | 'button-floor-round'
  | 'piston-round'
  | 'warning-traffic'
  | 'floor-large'
  | 'top-large-checkerboard'
  | 'door-wide-open'
  | 'indicator-special-arrow'
  | 'oopi'

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
      src={`/kit/${piece}.png`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      width={size}
      height={size}
      unoptimized
      draggable={false}
      className={cn('kit shrink-0', className)}
      style={style}
    />
  )
}

export const EQUIPMENT_PIECES: KitPiece[] = [
  'machine-window',
  'screen-wide',
  'scanner-high',
  'robot-arm-a',
  'hopper-high-round',
  'piston-round',
  'pipe-glass-large-curve',
  'crane-magnet',
  'machine-fortified',
  'cog-a',
  'screen-small',
  'box-large',
]

export function equipmentPiece(decisionIndex: number, optionIndex: number): KitPiece {
  return EQUIPMENT_PIECES[(decisionIndex * 3 + optionIndex) % EQUIPMENT_PIECES.length]
}
