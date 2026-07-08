/**
 * Banco local no navegador (localStorage), usado quando o Supabase não está
 * configurado. Mesmo formato de linhas das tabelas da nuvem, para os hooks
 * funcionarem com qualquer um dos dois modos.
 */
export type TabelaLocal = 'events' | 'notes' | 'expense_categories' | 'expenses'

const CHAVE = 'organizador-local-db-v1'

type Linha = { id: string } & Record<string, unknown>
type Banco = Record<TabelaLocal, Linha[]>

const VAZIO: Banco = { events: [], notes: [], expense_categories: [], expenses: [] }

function ler(): Banco {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return structuredClone(VAZIO)
    return { ...structuredClone(VAZIO), ...(JSON.parse(bruto) as Partial<Banco>) }
  } catch {
    return structuredClone(VAZIO)
  }
}

function salvar(banco: Banco) {
  localStorage.setItem(CHAVE, JSON.stringify(banco))
}

export const localDb = {
  listar<T>(tabela: TabelaLocal): T[] {
    return ler()[tabela] as unknown as T[]
  },

  inserir(tabela: TabelaLocal, linhas: Record<string, unknown> | Record<string, unknown>[]) {
    const banco = ler()
    const agora = new Date().toISOString()
    const lista = Array.isArray(linhas) ? linhas : [linhas]
    for (const linha of lista) {
      banco[tabela].push({
        id: crypto.randomUUID(),
        created_at: agora,
        updated_at: agora,
        reminded_at: null,
        ...linha,
      } as Linha)
    }
    salvar(banco)
  },

  atualizar(tabela: TabelaLocal, id: string, patch: Record<string, unknown>) {
    const banco = ler()
    banco[tabela] = banco[tabela].map((l) => (l.id === id ? { ...l, ...patch } : l))
    salvar(banco)
  },

  excluir(tabela: TabelaLocal, id: string) {
    const banco = ler()
    banco[tabela] = banco[tabela].filter((l) => l.id !== id)
    salvar(banco)
  },
}
