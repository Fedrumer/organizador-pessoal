export type Contexto = 'pessoal' | 'profissional'

export interface Evento {
  id: string
  user_id: string
  title: string
  description: string | null
  starts_at: string
  ends_at: string | null
  all_day: boolean
  context: Contexto
  reminder_minutes: number | null
  reminded_at: string | null
  created_at: string
}

export interface Nota {
  id: string
  user_id: string
  title: string
  content: string
  context: Contexto
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface Categoria {
  id: string
  user_id: string
  name: string
  color_index: number
  created_at: string
}

export interface Gasto {
  id: string
  user_id: string
  category_id: string | null
  description: string
  amount: number
  date: string
  context: Contexto
  payment_method: string | null
  created_at: string
}

export const CONTEXTOS: { value: Contexto; label: string }[] = [
  { value: 'pessoal', label: 'Pessoal' },
  { value: 'profissional', label: 'Profissional' },
]

export const LEMBRETES: { value: number; label: string }[] = [
  { value: 5, label: '5 minutos antes' },
  { value: 15, label: '15 minutos antes' },
  { value: 30, label: '30 minutos antes' },
  { value: 60, label: '1 hora antes' },
  { value: 1440, label: '1 dia antes' },
]

export const FORMAS_PAGAMENTO = [
  'Dinheiro',
  'Pix',
  'Cartão de débito',
  'Cartão de crédito',
  'Boleto',
] as const

export const CATEGORIAS_PADRAO: { name: string; color_index: number }[] = [
  { name: 'Moradia', color_index: 1 },
  { name: 'Saúde', color_index: 2 },
  { name: 'Alimentação', color_index: 3 },
  { name: 'Trabalho', color_index: 4 },
  { name: 'Lazer', color_index: 5 },
  { name: 'Contas', color_index: 6 },
  { name: 'Educação', color_index: 7 },
  { name: 'Transporte', color_index: 8 },
]

export function corCategoria(colorIndex: number): string {
  const idx = ((colorIndex - 1) % 8) + 1
  return `hsl(var(--chart-${idx}))`
}

export const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor)
