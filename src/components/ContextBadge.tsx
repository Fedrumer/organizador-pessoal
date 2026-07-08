import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { Contexto } from '@/types'

export function ContextBadge({ context, className }: { context: Contexto; className?: string }) {
  const pessoal = context === 'pessoal'
  return (
    <Badge
      variant="outline"
      className={cn(
        'shrink-0 border-transparent text-[11px] font-medium',
        pessoal
          ? 'bg-[hsl(var(--chart-5)/0.15)] text-[hsl(var(--chart-5))]'
          : 'bg-[hsl(var(--chart-1)/0.15)] text-[hsl(var(--chart-1))]',
        className,
      )}
    >
      {pessoal ? 'Pessoal' : 'Profissional'}
    </Badge>
  )
}
