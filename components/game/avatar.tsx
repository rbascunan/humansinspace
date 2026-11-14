import type { AvatarConfig, SuitStyle } from '@/lib/game/types'

const SUITS: Record<SuitStyle, { body: string; trim: string; label: string }> = {
  colorido: { body: '#f8fafc', trim: '#e05ab4', label: 'Colorido' },
  aerodinamico: { body: '#0ea5e9', trim: '#f8fafc', label: 'Aerodinámico' },
  elegante: { body: '#1e293b', trim: '#eab308', label: 'Elegante' },
  explorador: { body: '#f97316', trim: '#1e293b', label: 'Explorador' },
  clasico: { body: '#e2e8f0', trim: '#2563eb', label: 'Clásico' },
}

export const SUIT_OPTIONS = Object.entries(SUITS).map(([id, s]) => ({ id: id as SuitStyle, label: s.label }))

export function Avatar({
  config,
  suited = false,
  className,
  title,
}: {
  config: AvatarConfig
  suited?: boolean
  className?: string
  title?: string
}) {
  const suit = SUITS[config.suit]
  const body = suited ? suit.body : config.outfit
  const trim = suited ? (config.suit === 'colorido' ? config.outfit : suit.trim) : '#00000033'
  const isRobot = config.base === 'robot'
  const isFantasy = config.base === 'fantastico'

  return (
    <svg viewBox="0 0 120 160" className={className} role="img" aria-label={title ?? `Avatar ${config.profession}`}>
      {suited && <rect x="30" y="78" width="60" height="50" rx="10" fill="#475569" />}
      <rect x="40" y="128" width="16" height="26" rx="6" fill={suited ? body : '#334155'} />
      <rect x="64" y="128" width="16" height="26" rx="6" fill={suited ? body : '#334155'} />
      <rect x="38" y="150" width="20" height="8" rx="4" fill="#0f172a" />
      <rect x="62" y="150" width="20" height="8" rx="4" fill="#0f172a" />
      <rect x="22" y="84" width="14" height="40" rx="7" fill={body} />
      <rect x="84" y="84" width="14" height="40" rx="7" fill={body} />
      <circle cx="29" cy="126" r="6" fill={suited ? trim : config.skin} />
      <circle cx="91" cy="126" r="6" fill={suited ? trim : config.skin} />
      <rect x="34" y="78" width="52" height="56" rx="14" fill={body} />
      {suited ? (
        <>
          <rect x="34" y="100" width="52" height="6" fill={trim} />
          <rect x="50" y="86" width="20" height="12" rx="3" fill="#0f172a" />
          <circle cx="55" cy="92" r="2" fill="#22d3ee" />
          <circle cx="62" cy="92" r="2" fill="#facc15" />
          {config.suit === 'colorido' && (
            <>
              <circle cx="42" cy="118" r="4" fill="#facc15" />
              <circle cx="78" cy="116" r="5" fill="#22d3ee" />
            </>
          )}
          {config.suit === 'aerodinamico' && <path d="M34 124 L86 96 L86 104 L34 132 Z" fill={trim} opacity="0.8" />}
        </>
      ) : (
        <path d="M50 78 L60 92 L70 78" fill="none" stroke={trim} strokeWidth="4" strokeLinecap="round" />
      )}
      {config.accessory === 'corbata' && !suited && <path d="M57 88 L63 88 L65 118 L60 124 L55 118 Z" fill="#ef4444" />}

      {config.hair === 'largo' && !isRobot && (
        <rect x="34" y="40" width="52" height="42" rx="14" fill={config.hairColor} />
      )}

      {isRobot ? (
        <>
          <line x1="60" y1="20" x2="60" y2="30" stroke="#cbd5e1" strokeWidth="3" />
          <circle cx="60" cy="18" r="4" fill={config.hairColor} />
          <rect x="36" y="30" width="48" height="46" rx="12" fill={config.skin} />
          <rect x="42" y="44" width="36" height="14" rx="7" fill="#0f172a" />
          <rect x="46" y="48" width="10" height="6" rx="3" fill={config.hairColor} />
          <rect x="64" y="48" width="10" height="6" rx="3" fill={config.hairColor} />
          <rect x="50" y="64" width="20" height="4" rx="2" fill="#0f172a" />
        </>
      ) : (
        <>
          {isFantasy && (
            <>
              <path d="M38 46 L26 30 L44 38 Z" fill={config.skin} />
              <path d="M82 46 L94 30 L76 38 Z" fill={config.skin} />
            </>
          )}
          <circle cx="60" cy="52" r="24" fill={config.skin} />
          <ellipse cx="51" cy="53" rx="3.5" ry="4.5" fill="#0f172a" />
          <ellipse cx="69" cy="53" rx="3.5" ry="4.5" fill="#0f172a" />
          <circle cx="52" cy="51.5" r="1.2" fill="#fff" />
          <circle cx="70" cy="51.5" r="1.2" fill="#fff" />
          <path d="M53 64 Q60 70 67 64" fill="none" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="45" cy="61" r="3" fill="#f472b6" opacity="0.35" />
          <circle cx="75" cy="61" r="3" fill="#f472b6" opacity="0.35" />
        </>
      )}

      {!isRobot && config.hair === 'corto' && (
        <path d="M36 50 Q36 26 60 26 Q84 26 84 50 Q76 36 60 38 Q44 36 36 50 Z" fill={config.hairColor} />
      )}
      {!isRobot && config.hair === 'largo' && (
        <path d="M36 52 Q34 26 60 26 Q86 26 84 52 Q74 34 60 36 Q46 34 36 52 Z" fill={config.hairColor} />
      )}
      {!isRobot && config.hair === 'cresta' && (
        <path d="M52 32 L56 10 L60 28 L64 8 L68 32 Q60 36 52 32 Z" fill={config.hairColor} />
      )}
      {!isRobot && config.hair === 'rulos' && (
        <g fill={config.hairColor}>
          {[38, 46, 54, 62, 70, 78, 82].map((x, i) => (
            <circle key={x} cx={x} cy={i % 2 ? 30 : 36} r="8" />
          ))}
        </g>
      )}

      {!suited && config.accessory === 'sombrero' && (
        <g fill="#d6a756">
          <ellipse cx="60" cy="32" rx="38" ry="7" />
          <path d="M42 32 Q42 12 60 12 Q78 12 78 32 Z" />
          <rect x="42" y="26" width="36" height="4" fill="#92400e" />
        </g>
      )}
      {!suited && config.accessory === 'boina' && (
        <g>
          <ellipse cx="56" cy="30" rx="26" ry="9" fill="#dc2626" transform="rotate(-10 56 30)" />
          <circle cx="56" cy="21" r="3" fill="#dc2626" />
        </g>
      )}
      {!suited && config.accessory === 'gorra' && (
        <g fill={config.outfit}>
          <path d="M36 40 Q36 22 60 22 Q84 22 84 40 Z" />
          <rect x="60" y="36" width="34" height="6" rx="3" />
        </g>
      )}
      {!suited && config.accessory === 'casco' && (
        <g>
          <path d="M34 42 Q34 18 60 18 Q86 18 86 42 Z" fill="#facc15" />
          <circle cx="60" cy="28" r="5" fill="#f8fafc" />
        </g>
      )}
      {config.accessory === 'gafas' && !isRobot && (
        <g fill="none" stroke="#0f172a" strokeWidth="2.5">
          <circle cx="51" cy="53" r="7" fill="#22d3ee55" />
          <circle cx="69" cy="53" r="7" fill="#22d3ee55" />
          <line x1="58" y1="53" x2="62" y2="53" />
        </g>
      )}
      {config.accessory === 'gafas' && isRobot && (
        <rect x="40" y="42" width="40" height="18" rx="9" fill="none" stroke="#f8fafc" strokeWidth="2" />
      )}
      {!suited && config.accessory === 'auriculares' && (
        <g>
          <path d="M34 52 Q34 22 60 22 Q86 22 86 52" fill="none" stroke="#0f172a" strokeWidth="4" />
          <rect x="30" y="46" width="10" height="16" rx="5" fill="#e05ab4" />
          <rect x="80" y="46" width="10" height="16" rx="5" fill="#e05ab4" />
        </g>
      )}

      {suited && (
        <>
          <circle cx="60" cy="50" r="34" fill="#bae6fd" fillOpacity="0.22" stroke={suit.trim} strokeWidth="4" />
          <path d="M40 34 Q48 24 60 22" fill="none" stroke="#fff" strokeOpacity="0.7" strokeWidth="3" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}
