import { cn } from '@/lib/utils'

export function CreditsFooter({ className }: { className?: string }) {
  return (
    <footer className={cn('border-t border-border pt-6 pb-2 text-center text-sm text-muted-foreground', className)}>
      App creada por el team de <span className="font-semibold text-foreground">Betito Bascuñan</span> para la{' '}
      <span className="font-semibold text-primary">NASA Space Apps Challenge 2026</span>
    </footer>
  )
}
