import { useCallback, useEffect, useRef, useState } from 'react'
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { modoLocal, supabase } from '@/lib/supabase'
import { localDb } from '@/lib/local-db'
import { useAuth } from '@/contexts/auth-context'
import { CATEGORIAS_PADRAO, type Categoria, type Gasto } from '@/types'

export interface GastoInput {
  category_id: string | null
  description: string
  amount: number
  date: string
  context: Gasto['context']
  payment_method: string | null
}

/**
 * Carrega os gastos dos últimos 6 meses (para o gráfico de evolução)
 * e as categorias do usuário — criando as categorias padrão no primeiro acesso.
 */
export function useGastos(mesReferencia: Date) {
  const { user } = useAuth()
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [loading, setLoading] = useState(true)
  const seeded = useRef(false)

  const inicioJanela = format(startOfMonth(subMonths(mesReferencia, 5)), 'yyyy-MM-dd')
  const fimJanela = format(endOfMonth(mesReferencia), 'yyyy-MM-dd')

  const carregarCategorias = useCallback(async () => {
    if (!user) return
    if (modoLocal) {
      let lista = localDb.listar<Categoria>('expense_categories')
      if (lista.length === 0 && !seeded.current) {
        seeded.current = true
        localDb.inserir(
          'expense_categories',
          CATEGORIAS_PADRAO.map((c) => ({ ...c, user_id: user.id })),
        )
        lista = localDb.listar<Categoria>('expense_categories')
      }
      setCategorias([...lista].sort((a, b) => a.name.localeCompare(b.name)))
      return
    }
    const { data, error } = await supabase.from('expense_categories').select('*').order('name')
    if (error) return
    let lista = (data as Categoria[]) ?? []
    if (lista.length === 0 && !seeded.current) {
      seeded.current = true
      await supabase
        .from('expense_categories')
        .insert(CATEGORIAS_PADRAO.map((c) => ({ ...c, user_id: user.id })))
      const { data: novas } = await supabase.from('expense_categories').select('*').order('name')
      lista = (novas as Categoria[]) ?? []
    }
    setCategorias(lista)
  }, [user])

  const carregarGastos = useCallback(async () => {
    if (!user) return
    if (modoLocal) {
      const lista = localDb
        .listar<Gasto>('expenses')
        .filter((g) => g.date >= inicioJanela && g.date <= fimJanela)
        .sort((a, b) => b.date.localeCompare(a.date) || b.created_at.localeCompare(a.created_at))
      setGastos(lista)
      setLoading(false)
      return
    }
    const { data, error } = await supabase
      .from('expenses')
      .select('*')
      .gte('date', inicioJanela)
      .lte('date', fimJanela)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
    if (!error) setGastos((data as Gasto[]) ?? [])
    setLoading(false)
  }, [user, inicioJanela, fimJanela])

  useEffect(() => {
    carregarCategorias()
  }, [carregarCategorias])

  useEffect(() => {
    setLoading(true)
    carregarGastos()
  }, [carregarGastos])

  const criar = useCallback(
    async (input: GastoInput) => {
      if (!user) return { error: 'Não autenticado' }
      if (modoLocal) {
        localDb.inserir('expenses', { ...input, user_id: user.id })
        await carregarGastos()
        return { error: null }
      }
      const { error } = await supabase.from('expenses').insert({ ...input, user_id: user.id })
      if (!error) await carregarGastos()
      return { error: error?.message ?? null }
    },
    [user, carregarGastos],
  )

  const atualizar = useCallback(
    async (id: string, input: Partial<GastoInput>) => {
      if (modoLocal) {
        localDb.atualizar('expenses', id, input)
        await carregarGastos()
        return { error: null }
      }
      const { error } = await supabase.from('expenses').update(input).eq('id', id)
      if (!error) await carregarGastos()
      return { error: error?.message ?? null }
    },
    [carregarGastos],
  )

  const excluir = useCallback(
    async (id: string) => {
      if (modoLocal) {
        localDb.excluir('expenses', id)
        await carregarGastos()
        return { error: null }
      }
      const { error } = await supabase.from('expenses').delete().eq('id', id)
      if (!error) await carregarGastos()
      return { error: error?.message ?? null }
    },
    [carregarGastos],
  )

  return { gastos, categorias, loading, criar, atualizar, excluir }
}
