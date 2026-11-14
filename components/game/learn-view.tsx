import { BookOpen } from 'lucide-react'
import { GLOSSARY } from '@/lib/game/glossary'

export function LearnView() {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-accent">Biblioteca</p>
        <h1 className="text-3xl font-bold">Diccionario espacial</h1>
        <p className="text-muted-foreground">Conceptos explicados en criollo, con ejemplos de las misiones.</p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {GLOSSARY.map((c) => (
          <li key={c.id} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4">
            <h2 className="flex items-center gap-2 font-semibold">
              <BookOpen className="size-4 text-primary" aria-hidden /> {c.term}
            </h2>
            <p className="text-pretty text-sm text-muted-foreground">{c.simple}</p>
            <p className="mt-auto rounded-lg bg-primary/10 p-2 text-pretty text-xs text-primary">{c.example}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
