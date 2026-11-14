'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AvatarEditor } from './avatar-editor'
import { InterestPicker } from './interest-picker'
import { updateAvatar } from '@/lib/game/store'
import type { Profile } from '@/lib/game/types'

export function HangarView({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const [avatar, setAvatar] = useState(profile.avatar)
  const [interests, setInterests] = useState(profile.interests)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">Hangar</p>
          <h1 className="text-3xl font-bold">Tu avatar y tus intereses</h1>
        </div>
        <Button
          className="h-11 px-5 font-semibold"
          disabled={!interests.length}
          onClick={() => {
            updateAvatar(avatar, interests)
            onDone()
          }}
        >
          <Check /> Guardar cambios
        </Button>
      </div>
      <AvatarEditor value={avatar} onChange={setAvatar} />
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Intereses</h2>
        <InterestPicker value={interests} onChange={setInterests} />
      </section>
    </div>
  )
}
