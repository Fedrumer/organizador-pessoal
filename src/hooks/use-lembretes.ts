import { useCallback, useEffect, useState } from 'react'
import { addHours } from 'date-fns'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Evento } from '@/types'
import { formatarHorario } from '@/lib/datas'

/**
 * Verifica a cada minuto os eventos com lembrete cujo horário de alerta chegou
 * e dispara notificação do navegador + toast. Também expõe os eventos das
 * próximas 24h para o sino de notificações.
 */
export function useLembretes() {
  const { user } = useAuth()
  const [proximos, setProximos] = useState<Evento[]>([])

  const verificar = useCallback(async () => {
    if (!user) return
    const agora = new Date()
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('starts_at', agora.toISOString())
      .lte('starts_at', addHours(agora, 24).toISOString())
      .order('starts_at', { ascending: true })
    if (error || !data) return

    const eventos = data as Evento[]
    setProximos(eventos)

    const disparar = eventos.filter((e) => {
      if (e.reminder_minutes == null || e.reminded_at != null) return false
      const alerta = new Date(e.starts_at).getTime() - e.reminder_minutes * 60_000
      return alerta <= agora.getTime()
    })

    for (const evento of disparar) {
      const horario = formatarHorario(evento)
      toast(`Lembrete: ${evento.title}`, { description: horario, duration: 15_000 })
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Lembrete: ${evento.title}`, { body: horario })
      }
      await supabase
        .from('events')
        .update({ reminded_at: new Date().toISOString() })
        .eq('id', evento.id)
    }
  }, [user])

  useEffect(() => {
    if (!user) return
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
    verificar()
    const timer = setInterval(verificar, 60_000)
    return () => clearInterval(timer)
  }, [user, verificar])

  return { proximos }
}
