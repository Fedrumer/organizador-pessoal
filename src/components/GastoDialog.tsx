import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  CONTEXTOS,
  FORMAS_PAGAMENTO,
  corCategoria,
  type Categoria,
  type Contexto,
  type Gasto,
} from '@/types'
import type { GastoInput } from '@/hooks/use-gastos'

interface Props {
  aberto: boolean
  aoFechar: () => void
  gasto?: Gasto | null
  categorias: Categoria[]
  aoSalvar: (input: GastoInput) => Promise<{ error: string | null }>
  aoExcluir?: (id: string) => Promise<{ error: string | null }>
}

export function GastoDialog({ aberto, aoFechar, gasto, categorias, aoSalvar, aoExcluir }: Props) {
  const [descricao, setDescricao] = useState('')
  const [valor, setValor] = useState('')
  const [data, setData] = useState('')
  const [categoriaId, setCategoriaId] = useState<string>('')
  const [contexto, setContexto] = useState<Contexto>('pessoal')
  const [pagamento, setPagamento] = useState<string>('nenhum')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setDescricao(gasto?.description ?? '')
    setValor(gasto ? String(gasto.amount).replace('.', ',') : '')
    setData(gasto?.date ?? format(new Date(), 'yyyy-MM-dd'))
    setCategoriaId(gasto?.category_id ?? categorias[0]?.id ?? '')
    setContexto(gasto?.context ?? 'pessoal')
    setPagamento(gasto?.payment_method ?? 'nenhum')
  }, [aberto, gasto, categorias])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    const numero = Number(valor.replace(/\./g, '').replace(',', '.'))
    if (!Number.isFinite(numero) || numero <= 0) {
      toast.error('Informe um valor válido, ex.: 45,90')
      return
    }
    setSalvando(true)
    const { error } = await aoSalvar({
      description: descricao.trim(),
      amount: Math.round(numero * 100) / 100,
      date: data,
      category_id: categoriaId || null,
      context: contexto,
      payment_method: pagamento === 'nenhum' ? null : pagamento,
    })
    setSalvando(false)
    if (error) {
      toast.error('Não foi possível salvar o gasto', { description: error })
      return
    }
    toast.success(gasto ? 'Gasto atualizado.' : 'Gasto registrado.')
    aoFechar()
  }

  const excluir = async () => {
    if (!gasto || !aoExcluir) return
    const { error } = await aoExcluir(gasto.id)
    if (error) {
      toast.error('Não foi possível excluir', { description: error })
      return
    }
    toast.success('Gasto excluído.')
    aoFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && aoFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {gasto ? 'Editar gasto' : 'Registrar gasto'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricao-gasto">Descrição</Label>
            <Input
              id="descricao-gasto"
              required
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex.: Supermercado"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="valor-gasto">Valor (R$)</Label>
              <Input
                id="valor-gasto"
                required
                inputMode="decimal"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data-gasto">Data</Label>
              <Input
                id="data-gasto"
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categorias.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: corCategoria(c.color_index) }}
                      />
                      {c.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Contexto</Label>
              <Select value={contexto} onValueChange={(v) => setContexto(v as Contexto)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTEXTOS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Pagamento</Label>
              <Select value={pagamento} onValueChange={setPagamento}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Não informar</SelectItem>
                  {FORMAS_PAGAMENTO.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {gasto && aoExcluir && (
              <Button type="button" variant="destructive" onClick={excluir} className="sm:mr-auto">
                Excluir
              </Button>
            )}
            <Button type="submit" disabled={salvando}>
              {salvando ? 'Salvando…' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
