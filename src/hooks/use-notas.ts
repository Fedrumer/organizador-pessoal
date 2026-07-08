import { useCallback, useEffect, useState } from 'react'
import { modoLocal, supabase } from '@/lib/supabase'
import { localDb } from '@/lib/local-db'
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
    if (modoLocal) {
      const todas = localDb
        .listar<Nota>('notes')
        .sort(
          (a, b) =>
            Number(b.pinned) - Number(a.pinned) || b.updated_at.localeCompare(a.updated_at),
        )
      setNotas(todas)
      setLoading(false)
      return
    }
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
      if (modoLocal) {
        localDb.inserir('notes', { ...input, user_id: user.id })
        await carregar()
        return { error: null }
      }
      const { error } = await supabase.from('notes').insert({ ...input, user_id: user.id })
      if (!error) await carregar()
      return { error: error?.message ?? null }
    },
    [user, carregar],
  )

  const atualizar = useCallback(
    async (id: string, input: Partial<NotaInput>) => {
      const patch = { ...input, updated_at: new Date().toISOString() }
      if (modoLocal) {
        localDb.atualizar('notes', id, patch)
        await carregar()
        return { error: null }
      }
      const { error } = await supabase.from('notes').update(patch).eq('id', id)
      if (!error) await carregar()
      return { error: error?.message ?? null }
    },
    [carregar],
  )

  const excluir = useCallback(
    async (id: string) => {
      if (modoLocal) {
        localDb.excluir('notes', id)
        await carregar()
        return { error: null }
      }
      const { error } = await supabase.from('notes').delete().eq('id', id)
      if (!error) await carregar()
      return { error: error?.message ?? null }
    },
    [carregar],
  )

  return { notas, loading, criar, atualizar, excluir }
}
