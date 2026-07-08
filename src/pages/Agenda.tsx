import { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useEventos } from '@/hooks/use-eventos'
import { EventoDialog } from '@/components/EventoDialog'
import { ContextBadge } from '@/components/ContextBadge'
import { nomeMes } from '@/lib/datas'
import type { Evento } from '@/types'

const DIAS_SEMANA = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

export default function Agenda() {
  const [mes, setMes] = useState(() => startOfMonth(new Date()))
  const [diaSelecionado, setDiaSelecionado] = useState(() => new Date())
  const [dialogAberto, setDialogAberto] = useState(false)
  const [eventoEditando, setEventoEditando] = useState<Evento | null>(null)

  const gridInicio = useMemo(() => startOfWeek(startOfMonth(mes)), [mes])
  const gridFim = useMemo(() => endOfWeek(endOfMonth(mes)), [mes])
  const dias = useMemo(
    () => eachDayOfInterval({ start: gridInicio, end: addDays(gridFim, 0) }),
    [gridInicio, gridFim],
  )

  const { eventos, criar, atualizar, excluir } = useEventos(gridInicio, gridFim)

  const eventosDoDia = (dia: Date) => eventos.filter((e) => isSameDay(new Date(e.starts_at), dia))
  const listaDia = eventosDoDia(diaSelecionado)

  const abrirNovo = () => {
    setEventoEditando(null)
    setDialogAberto(true)
  }

  const abrirEdicao = (evento: Evento) => {
    setEventoEditando(evento)
    setDialogAberto(true)
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Agenda</h1>
          <p className="text-sm text-muted-foreground">Seus compromissos e alertas.</p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="mr-1.5 h-4 w-4" />
          Novo compromisso
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Calendário mensal */}
        <Card className="p-4 sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">{nomeMes(mes)}</h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => setMes(subMonths(mes, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMes(startOfMonth(new Date()))
                  setDiaSelecionado(new Date())
                }}
              >
                Hoje
              </Button>
              <Button variant="ghost" size="icon" aria-label="Próximo mês" onClick={() => setMes(addMonths(mes, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-7 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {DIAS_SEMANA.map((d) => (
              <div key={d} className="pb-2">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {dias.map((dia) => {
              const doDia = eventosDoDia(dia)
              const selecionado = isSameDay(dia, diaSelecionado)
              return (
                <button
                  key={dia.toISOString()}
                  type="button"
                  onClick={() => setDiaSelecionado(dia)}
                  className={cn(
                    'flex min-h-[64px] flex-col items-center gap-1 rounded-lg border border-transparent p-1.5 text-sm transition-colors sm:min-h-[76px]',
                    isSameMonth(dia, mes) ? 'text-foreground' : 'text-muted-foreground/50',
                    selecionado
                      ? 'border-primary/50 bg-primary/10'
                      : 'hover:bg-secondary',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-7 w-7 items-center justify-center rounded-full text-sm',
                      isToday(dia) && 'bg-primary font-semibold text-primary-foreground',
                    )}
                  >
                    {format(dia, 'd')}
                  </span>
                  {doDia.length > 0 && (
                    <span className="flex flex-wrap items-center justify-center gap-0.5">
                      {doDia.slice(0, 3).map((e) => (
                        <span
                          key={e.id}
                          className={cn(
                            'h-1.5 w-1.5 rounded-full',
                            e.context === 'pessoal'
                              ? 'bg-[hsl(var(--chart-5))]'
                              : 'bg-[hsl(var(--chart-1))]',
                          )}
                        />
                      ))}
                      {doDia.length > 3 && (
                        <span className="text-[10px] leading-none text-muted-foreground">
                          +{doDia.length - 3}
                        </span>
                      )}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </Card>

        {/* Lista do dia selecionado */}
        <Card className="h-fit p-5">
          <h2 className="text-base font-semibold">{nomeDiaSelecionado(diaSelecionado)}</h2>
          {listaDia.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhum compromisso neste dia.{' '}
              <button type="button" className="text-primary hover:underline" onClick={abrirNovo}>
                Criar um agora
              </button>
              .
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {listaDia.map((evento) => (
                <li key={evento.id}>
                  <button
                    type="button"
                    onClick={() => abrirEdicao(evento)}
                    className="w-full rounded-lg border bg-background/50 p-3 text-left transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium">{evento.title}</p>
                      <ContextBadge context={evento.context} />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {evento.all_day
                        ? 'O dia todo'
                        : `${format(new Date(evento.starts_at), 'HH:mm')}${
                            evento.ends_at
                              ? ` – ${format(new Date(evento.ends_at), 'HH:mm')}`
                              : ''
                          }`}
                    </p>
                    {evento.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {evento.description}
                      </p>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <EventoDialog
        aberto={dialogAberto}
        aoFechar={() => setDialogAberto(false)}
        evento={eventoEditando}
        dataInicial={diaSelecionado}
        aoSalvar={(input) =>
          eventoEditando ? atualizar(eventoEditando.id, input) : criar(input)
        }
        aoExcluir={excluir}
      />
    </div>
  )
}

function nomeDiaSelecionado(dia: Date): string {
  const texto = format(dia, "EEEE, d 'de' MMMM", { locale: ptBR })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
