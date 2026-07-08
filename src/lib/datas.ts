import { format, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { Evento } from '@/types'

export function formatarHorario(evento: Evento): string {
  const inicio = new Date(evento.starts_at)
  let dia: string
  if (isToday(inicio)) dia = 'Hoje'
  else if (isTomorrow(inicio)) dia = 'Amanhã'
  else dia = format(inicio, "EEEE, d 'de' MMMM", { locale: ptBR })

  if (evento.all_day) return `${dia} · o dia todo`

  const hora = format(inicio, 'HH:mm')
  if (evento.ends_at) return `${dia} · ${hora} – ${format(new Date(evento.ends_at), 'HH:mm')}`
  return `${dia} · ${hora}`
}

export const nomeMes = (data: Date) =>
  format(data, "MMMM 'de' yyyy", { locale: ptBR }).replace(/^./, (c) => c.toUpperCase())
