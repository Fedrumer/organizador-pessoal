import { useMemo, useState } from 'react'
import {
  addMonths,
  format,
  isSameMonth,
  parseISO,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Plus, Wallet } from 'lucide-react'
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useGastos } from '@/hooks/use-gastos'
import { GastoDialog } from '@/components/GastoDialog'
import { ContextBadge } from '@/components/ContextBadge'
import { nomeMes } from '@/lib/datas'
import { corCategoria, formatarMoeda, type Gasto } from '@/types'

export default function Gastos() {
  const [mes, setMes] = useState(() => startOfMonth(new Date()))
  const [dialogAberto, setDialogAberto] = useState(false)
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null)

  const { gastos, categorias, loading, criar, atualizar, excluir } = useGastos(mes)

  const doMes = useMemo(
    () => gastos.filter((g) => isSameMonth(parseISO(g.date), mes)),
    [gastos, mes],
  )

  const totalMes = doMes.reduce((soma, g) => soma + Number(g.amount), 0)
  const totalPessoal = doMes
    .filter((g) => g.context === 'pessoal')
    .reduce((s, g) => s + Number(g.amount), 0)
  const totalProfissional = totalMes - totalPessoal

  const porCategoria = useMemo(() => {
    const mapa = new Map<string, number>()
    for (const g of doMes) {
      const chave = g.category_id ?? 'sem'
      mapa.set(chave, (mapa.get(chave) ?? 0) + Number(g.amount))
    }
    return [...mapa.entries()]
      .map(([id, valor]) => {
        const cat = categorias.find((c) => c.id === id)
        return {
          nome: cat?.name ?? 'Sem categoria',
          valor: Math.round(valor * 100) / 100,
          cor: cat ? corCategoria(cat.color_index) : 'hsl(var(--muted-foreground))',
        }
      })
      .sort((a, b) => b.valor - a.valor)
  }, [doMes, categorias])

  const evolucao = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => {
      const m = subMonths(mes, 5 - i)
      const total = gastos
        .filter((g) => isSameMonth(parseISO(g.date), m))
        .reduce((s, g) => s + Number(g.amount), 0)
      return {
        mes: format(m, 'MMM', { locale: ptBR }),
        total: Math.round(total * 100) / 100,
      }
    })
  }, [gastos, mes])

  const abrirNovo = () => {
    setGastoEditando(null)
    setDialogAberto(true)
  }

  const abrirEdicao = (gasto: Gasto) => {
    setGastoEditando(gasto)
    setDialogAberto(true)
  }

  const nomeCategoria = (id: string | null) =>
    categorias.find((c) => c.id === id)?.name ?? 'Sem categoria'

  const corDaCategoria = (id: string | null) => {
    const cat = categorias.find((c) => c.id === id)
    return cat ? corCategoria(cat.color_index) : 'hsl(var(--muted-foreground))'
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Gastos</h1>
          <p className="text-sm text-muted-foreground">Controle suas despesas mês a mês.</p>
        </div>
        <Button onClick={abrirNovo}>
          <Plus className="mr-1.5 h-4 w-4" />
          Registrar gasto
        </Button>
      </div>

      {/* Navegação do mês */}
      <div className="mb-6 flex items-center gap-2">
        <Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => setMes(subMonths(mes, 1))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="min-w-44 text-center text-lg font-semibold">{nomeMes(mes)}</h2>
        <Button variant="ghost" size="icon" aria-label="Próximo mês" onClick={() => setMes(addMonths(mes, 1))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={() => setMes(startOfMonth(new Date()))}>
          Mês atual
        </Button>
      </div>

      {/* Cards de resumo */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Total do mês
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">{formatarMoeda(totalMes)}</p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Pessoal
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {formatarMoeda(totalPessoal)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Profissional
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            {formatarMoeda(totalProfissional)}
          </p>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-sm font-semibold">Por categoria</h3>
          {porCategoria.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Sem gastos neste mês.
            </p>
          ) : (
            <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row">
              <ResponsiveContainer width={180} height={180}>
                <PieChart>
                  <Pie
                    data={porCategoria}
                    dataKey="valor"
                    nameKey="nome"
                    innerRadius={52}
                    outerRadius={82}
                    paddingAngle={2}
                    stroke="hsl(var(--card))"
                    strokeWidth={2}
                  >
                    {porCategoria.map((item) => (
                      <Cell key={item.nome} fill={item.cor} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatarMoeda(v)}
                    contentStyle={{
                      background: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: 8,
                      color: 'hsl(var(--popover-foreground))',
                      fontSize: 13,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legenda com valores — identidade nunca só pela cor */}
              <ul className="w-full flex-1 space-y-1.5">
                {porCategoria.map((item) => (
                  <li key={item.nome} className="flex items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: item.cor }}
                    />
                    <span className="flex-1 truncate">{item.nome}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {formatarMoeda(item.valor)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="text-sm font-semibold">Últimos 6 meses</h3>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={evolucao} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                <XAxis
                  dataKey="mes"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                  formatter={(v: number) => [formatarMoeda(v), 'Total']}
                  cursor={{ fill: 'hsl(var(--secondary))' }}
                  contentStyle={{
                    background: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 8,
                    color: 'hsl(var(--popover-foreground))',
                    fontSize: 13,
                  }}
                />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--chart-3))"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Lista de gastos do mês */}
      <Card>
        <div className="border-b px-5 py-4">
          <h3 className="text-sm font-semibold">Lançamentos de {nomeMes(mes).toLowerCase()}</h3>
        </div>
        {loading ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Carregando…</p>
        ) : doMes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <Wallet className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nenhum gasto registrado neste mês.</p>
            <Button variant="outline" size="sm" onClick={abrirNovo}>
              <Plus className="mr-1.5 h-4 w-4" />
              Registrar gasto
            </Button>
          </div>
        ) : (
          <ul className="divide-y">
            {doMes.map((gasto) => (
              <li key={gasto.id}>
                <button
                  type="button"
                  onClick={() => abrirEdicao(gasto)}
                  className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-secondary/60"
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ background: corDaCategoria(gasto.category_id) }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{gasto.description}</span>
                    <span className="block text-xs text-muted-foreground">
                      {format(parseISO(gasto.date), "d 'de' MMMM", { locale: ptBR })} ·{' '}
                      {nomeCategoria(gasto.category_id)}
                      {gasto.payment_method ? ` · ${gasto.payment_method}` : ''}
                    </span>
                  </span>
                  <ContextBadge context={gasto.context} className="hidden sm:inline-flex" />
                  <span className="text-sm font-semibold tabular-nums">
                    {formatarMoeda(Number(gasto.amount))}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <GastoDialog
        aberto={dialogAberto}
        aoFechar={() => setDialogAberto(false)}
        gasto={gastoEditando}
        categorias={categorias}
        aoSalvar={(input) => (gastoEditando ? atualizar(gastoEditando.id, input) : criar(input))}
        aoExcluir={excluir}
      />
    </div>
  )
}
