import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { addDays, endOfMonth, format, startOfMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ArrowRight, CalendarDays, Pin, Plus, StickyNote, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useAuth, nomeExibicao } from '@/contexts/auth-context'
import { ContextBadge } from '@/components/ContextBadge'
import { formatarHorario } from '@/lib/datas'
import { formatarMoeda, type Evento, type Nota } from '@/types'

function saudacao(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

export default function Dashboard() {
  const { user } = useAuth()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [notasFixadas, setNotasFixadas] = useState<Nota[]>([])
  const [totalMes, setTotalMes] = useState(0)

  useEffect(() => {
    if (!user) return
    const agora = new Date()

    supabase
      .from('events')
      .select('*')
      .gte('starts_at', agora.toISOString())
      .lte('starts_at', addDays(agora, 7).toISOString())
      .order('starts_at', { ascending: true })
      .limit(5)
      .then(({ data }) => setEventos((data as Evento[]) ?? []))

    supabase
      .from('notes')
      .select('*')
      .eq('pinned', true)
      .order('updated_at', { ascending: false })
      .limit(4)
      .then(({ data }) => setNotasFixadas((data as Nota[]) ?? []))

    supabase
      .from('expenses')
      .select('amount')
      .gte('date', format(startOfMonth(agora), 'yyyy-MM-dd'))
      .lte('date', format(endOfMonth(agora), 'yyyy-MM-dd'))
      .then(({ data }) => {
        const total = (data ?? []).reduce(
          (soma, linha) => soma + Number((linha as { amount: number }).amount),
          0,
        )
        setTotalMes(total)
      })
  }, [user])

  const hoje = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })

  return (
    <div className="mx-auto max-w-6xl animate-fade-in-up">
      <div className="mb-8">
        <p className="text-sm capitalize text-muted-foreground">{hoje}</p>
        <h1 className="mt-1 text-3xl font-semibold">
          {saudacao()}, {nomeExibicao(user)} <span aria-hidden>👋</span>
        </h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Próximos compromissos */}
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <CalendarDays className="h-4 w-4 text-primary" />
              Próximos compromissos
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/agenda">
                Ver agenda
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {eventos.length === 0 ? (
            <div className="flex flex-col items-start gap-3 py-6">
              <p className="text-sm text-muted-foreground">
                Nenhum compromisso nos próximos 7 dias.
              </p>
              <Button asChild variant="outline" size="sm">
                <Link to="/agenda">
                  <Plus className="mr-1.5 h-4 w-4" />
                  Criar compromisso
                </Link>
              </Button>
            </div>
          ) : (
            <ul className="mt-4 space-y-2">
              {eventos.map((evento) => (
                <li
                  key={evento.id}
                  className="flex items-start justify-between gap-3 rounded-lg border bg-background/50 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{evento.title}</p>
                    <p className="text-xs text-muted-foreground">{formatarHorario(evento)}</p>
                  </div>
                  <ContextBadge context={evento.context} />
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Gastos do mês */}
        <Card className="flex flex-col p-5">
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Wallet className="h-4 w-4 text-primary" />
            Gastos do mês
          </h2>
          <p className="mt-4 text-3xl font-semibold tabular-nums">{formatarMoeda(totalMes)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            total registrado em {format(new Date(), 'MMMM', { locale: ptBR })}
          </p>
          <Button asChild variant="outline" size="sm" className="mt-auto w-fit">
            <Link to="/gastos">
              Ver detalhes
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </Card>

        {/* Notas fixadas */}
        <Card className="p-5 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-base font-semibold">
              <StickyNote className="h-4 w-4 text-primary" />
              Notas fixadas
            </h2>
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground">
              <Link to="/notas">
                Ver todas
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
          {notasFixadas.length === 0 ? (
            <p className="py-6 text-sm text-muted-foreground">
              Fixe suas notas importantes para vê-las aqui.
            </p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {notasFixadas.map((nota) => (
                <Link
                  key={nota.id}
                  to="/notas"
                  className="rounded-lg border bg-background/50 p-3 transition-colors hover:border-primary/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate text-sm font-medium">{nota.title}</p>
                    <Pin className="h-3.5 w-3.5 shrink-0 text-primary" />
                  </div>
                  <p className="mt-1 line-clamp-3 text-xs text-muted-foreground">{nota.content}</p>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
