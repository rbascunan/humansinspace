import { countryName } from '@/lib/game/countries'
import { cn } from '@/lib/utils'

export function Flag({ code, className }: { code: string | null | undefined; className?: string }) {
  if (!code) return null
  const name = countryName(code)
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={name}
      title={name}
      width={20}
      height={14}
      loading="lazy"
      className={cn('inline-block h-3.5 w-5 shrink-0 rounded-[2px] object-cover ring-1 ring-black/20', className)}
    />
  )
}
