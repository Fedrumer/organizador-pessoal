import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import type { Nota } from '@/types'

export interface NotaInput {
  title: string
  content: string
  context: Nota['context']
  pinned: boolean
}

export function useNotas() {
  const { user } = useAuth()
  const [notas, setNotas] = useState<Nota[]>([])
  const [loading, setLoading] = useState(true)

  const carregar = useCallback(async () => {
    if (!user) return
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('pinned', { ascending: false })
      .order('updated_at', { ascending: false })
    if (!error) setNotas((data as Nota[]) ?? [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    carregar()
  }, [carregar])

  const criar = useCallback(
    async (input: NotaInput) => {
      if (!user) return { error: 'Não autenticado' }
      const { error } = await supabase.from('notes').insert({ ...input, user_id: user.id })
      if (!error) await carregar()
      return { error: error?.message ?? null }
    },
    [user, carregar],
  )

  const atualizar = useCallback(
    async (id: string, input: Partial<NotaInput>) => {
      const { error } = await supabase
        .from('notes')
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq('id', id)
      if (!error) await carregar()
      return { error: error?.message ?? null }
    },
    [carregar],
  )

  const excluir = useCallback(
    async (id: string) => {
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (!error) await carregar()
      return { error: error?.message ?? null }
    },
    [carregar],
  )

  return { notas, loading, criar, atualizar, excluir }
}
