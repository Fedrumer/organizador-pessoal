import { useEffect, useState } from 'react'
import { Pin } from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CONTEXTOS, type Contexto, type Nota } from '@/types'
import type { NotaInput } from '@/hooks/use-notas'

interface Props {
  aberto: boolean
  aoFechar: () => void
  nota?: Nota | null
  aoSalvar: (input: NotaInput) => Promise<{ error: string | null }>
  aoExcluir?: (id: string) => Promise<{ error: string | null }>
}

export function NotaDialog({ aberto, aoFechar, nota, aoSalvar, aoExcluir }: Props) {
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [contexto, setContexto] = useState<Contexto>('pessoal')
  const [fixada, setFixada] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setTitulo(nota?.title ?? '')
    setConteudo(nota?.content ?? '')
    setContexto(nota?.context ?? 'pessoal')
    setFixada(nota?.pinned ?? false)
  }, [aberto, nota])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    const { error } = await aoSalvar({
      title: titulo.trim(),
      content: conteudo.trim(),
      context: contexto,
      pinned: fixada,
    })
    setSalvando(false)
    if (error) {
      toast.error('Não foi possível salvar a nota', { description: error })
      return
    }
    toast.success(nota ? 'Nota atualizada.' : 'Nota criada.')
    aoFechar()
  }

  const excluir = async () => {
    if (!nota || !aoExcluir) return
    const { error } = await aoExcluir(nota.id)
    if (error) {
      toast.error('Não foi possível excluir', { description: error })
      return
    }
    toast.success('Nota excluída.')
    aoFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && aoFechar()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display">{nota ? 'Editar nota' : 'Nova nota'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo-nota">Título</Label>
            <Input
              id="titulo-nota"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Ideias para o fim de semana"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="conteudo-nota">Conteúdo</Label>
            <Textarea
              id="conteudo-nota"
              value={conteudo}
              onChange={(e) => setConteudo(e.target.value)}
              placeholder="Escreva aqui…"
              rows={8}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="w-44 space-y-2">
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
            <label
              htmlFor="fixada"
              className="flex cursor-pointer items-center gap-2 pt-6 text-sm"
            >
              <Pin className="h-4 w-4 text-muted-foreground" />
              Fixar
              <Switch id="fixada" checked={fixada} onCheckedChange={setFixada} />
            </label>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {nota && aoExcluir && (
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
