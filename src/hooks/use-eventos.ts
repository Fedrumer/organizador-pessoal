import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Evento } from '@/types'

export interface EventoInput {
  title: string
  description: string | null
  starts_at: string
  ends_at: string | null
  all_day: boolean
  context: Evento['context']
  reminder_minutes: number | null
}

export function useEventos(rangeStart: Date, rangeEnd: Date) {
  const { user } = useAuth()
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)

  const inicioMs = rangeStart.getTime()
  const fimMs = rangeEnd.getTime()

  const carregar = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('starts_at', new Date(inicioMs).toISOString())
      .lte('starts_at', new Date(fimMs).toISOString())
      .order('starts_at', { ascending: true })
    if (!error) setEventos((data as Evento[]) ?? [])
    setLoading(false)
  }, [user, inicioMs, fimMs])

  useEffect(() => {
    setLoading(true)
    carregar()
  }, [carregar])

  const criar = useCallback(
    async (input: EventoInput) => {
      if (!user) return { error: 'Não autenticado' }
      const { error } = await supabase.from('events').insert({ ...input, user_id: user.id })
      if (!error) await carregar()
      return { error: error?.message ?? null }
    },
    [user, carregar],
  )

  const atualizar = useCallback(
    async (id: string, input: Partial<EventoInput>) => {
      // Alterar horário/lembrete reabilita o alerta
      const patch =
        'starts_at' in input || 'reminder_minutes' in input
          ? { ...input, reminded_at: null }
          : input
      const { error } = await supabase.from('events').update(patch).eq('id', id)
      if (!error) await carregar()
      return { error: error?.message ?? null }
    },
    [carregar],
  )

  const excluir = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('events').delete().eq('id', id)
      if (!error) await carregar()
      return { error: error?.message ?? null }
    },
    [carregar],
  )

  return { eventos, loading, criar, atualizar, excluir, recarregar: carregar }
}
