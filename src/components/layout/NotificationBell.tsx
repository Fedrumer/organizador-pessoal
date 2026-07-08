import { Bell, BellRing } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Evento } from '@/types'
import { formatarHorario } from '@/lib/datas'
import { ContextBadge } from '@/components/ContextBadge'

export function NotificationBell({ eventos }: { eventos: Evento[] }) {
  const temEventos = eventos.length > 0

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Próximos compromissos">
          {temEventos ? <BellRing className="h-[18px] w-[18px]" /> : <Bell className="h-[18px] w-[18px]" />}
          {temEventos && (
            <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {eventos.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Próximas 24 horas</p>
        </div>
        {temEventos ? (
          <ScrollArea className="max-h-80">
            <ul className="divide-y">
              {eventos.map((evento) => (
                <li key={evento.id} className="flex items-start justify-between gap-2 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{evento.title}</p>
                    <p className="text-xs text-muted-foreground">{formatarHorario(evento)}</p>
                  </div>
                  <ContextBadge context={evento.context} />
                </li>
              ))}
            </ul>
          </ScrollArea>
        ) : (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nenhum compromisso nas próximas 24 horas.
          </p>
        )}
      </PopoverContent>
    </Popover>
  )
}
