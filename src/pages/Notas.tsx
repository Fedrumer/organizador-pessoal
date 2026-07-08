import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Pin, Plus, Search, StickyNote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { useNotas } from '@/hooks/use-notas'
import { NotaDialog } from '@/components/NotaDialog'
import { ContextBadge } from '@/components/ContextBadge'
import type { Nota } from '@/types'

type Filtro = 'todas' | 'pessoal' | 'profissional'

export default function Notas() {
  const { notas, loading, criar, atualizar, excluir } = useNotas()
  const [busca, setBusca] = useState('')
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [dialogAberto, setDialogAberto] = useState(false)
  const [notaEditando, setNotaEditando] = useState<Nota | null>(null)

  const filtradas = useMemo(() => {
    const termo = busca.trim().toLowerCase()
    return notas.filter((n) => {
      if (filtro !== 'todas' && n.context !== filtro) return false
      if (!termo) return true
      return n.title.toLowerCase().includes(termo) || n.content.toLowerCase().includes(termo)
    })
  }, [notas, busca, filtro])

  const abrirNova = () => {
    setNotaEditando(null)
    setDialogAberto(true)
  }

  const abrirEdicao = (nota: Nota) => {
    setNotaEditando(nota)
    setDialogAberto(true)
  }

  return (
    <div className="mx-auto max-w-6xl animate-fade-in-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Notas</h1>
          <p className="text-sm text-muted-foreground">Suas anotações rápidas e ideias.</p>
        </div>
        <Button onClick={abrirNova}>
          <Plus className="mr-1.5 h-4 w-4" />
          Nova nota
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar notas…"
            className="pl-9"
          />
        </div>
        <Tabs value={filtro} onValueChange={(v) => setFiltro(v as Filtro)}>
          <TabsList>
            <TabsTrigger value="todas">Todas</TabsTrigger>
            <TabsTrigger value="pessoal">Pessoal</TabsTrigger>
            <TabsTrigger value="profissional">Profissional</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {loading ? (
        <p className="py-16 text-center text-sm text-muted-foreground">Carregando…</p>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-16 text-center">
          <StickyNote className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {notas.length === 0
              ? 'Você ainda não tem notas. Crie a primeira!'
              : 'Nenhuma nota encontrada com esse filtro.'}
          </p>
          {notas.length === 0 && (
            <Button variant="outline" size="sm" onClick={abrirNova}>
              <Plus className="mr-1.5 h-4 w-4" />
              Criar nota
            </Button>
          )}
        </div>
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
          {filtradas.map((nota) => (
            <Card
              key={nota.id}
              role="button"
              tabIndex={0}
              onClick={() => abrirEdicao(nota)}
              onKeyDown={(e) => e.key === 'Enter' && abrirEdicao(nota)}
              className={cn(
                'cursor-pointer p-4 transition-all hover:-translate-y-0.5 hover:shadow-elevation',
                nota.pinned && 'border-primary/40',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display text-base font-semibold leading-snug">{nota.title}</h3>
                {nota.pinned && <Pin className="h-4 w-4 shrink-0 text-primary" />}
              </div>
              {nota.content && (
                <p className="mt-2 line-clamp-6 whitespace-pre-wrap text-sm text-muted-foreground">
                  {nota.content}
                </p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <ContextBadge context={nota.context} />
                <span className="text-[11px] text-muted-foreground">
                  {format(new Date(nota.updated_at), "d MMM yyyy", { locale: ptBR })}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NotaDialog
        aberto={dialogAberto}
        aoFechar={() => setDialogAberto(false)}
        nota={notaEditando}
        aoSalvar={(input) => (notaEditando ? atualizar(notaEditando.id, input) : criar(input))}
        aoExcluir={excluir}
      />
    </div>
  )
}
