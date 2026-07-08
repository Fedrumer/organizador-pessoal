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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { CONTEXTOS, LEMBRETES, type Contexto, type Evento } from '@/types'
import type { EventoInput } from '@/hooks/use-eventos'

interface Props {
  aberto: boolean
  aoFechar: () => void
  evento?: Evento | null
  dataInicial?: Date
  aoSalvar: (input: EventoInput) => Promise<{ error: string | null }>
  aoExcluir?: (id: string) => Promise<{ error: string | null }>
}

export function EventoDialog({ aberto, aoFechar, evento, dataInicial, aoSalvar, aoExcluir }: Props) {
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [data, setData] = useState('')
  const [diaTodo, setDiaTodo] = useState(false)
  const [horaInicio, setHoraInicio] = useState('09:00')
  const [horaFim, setHoraFim] = useState('')
  const [contexto, setContexto] = useState<Contexto>('pessoal')
  const [lembrete, setLembrete] = useState<string>('30')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    if (evento) {
      const inicio = new Date(evento.starts_at)
      setTitulo(evento.title)
      setDescricao(evento.description ?? '')
      setData(format(inicio, 'yyyy-MM-dd'))
      setDiaTodo(evento.all_day)
      setHoraInicio(format(inicio, 'HH:mm'))
      setHoraFim(evento.ends_at ? format(new Date(evento.ends_at), 'HH:mm') : '')
      setContexto(evento.context)
      setLembrete(evento.reminder_minutes == null ? 'nenhum' : String(evento.reminder_minutes))
    } else {
      setTitulo('')
      setDescricao('')
      setData(format(dataInicial ?? new Date(), 'yyyy-MM-dd'))
      setDiaTodo(false)
      setHoraInicio('09:00')
      setHoraFim('')
      setContexto('pessoal')
      setLembrete('30')
    }
  }, [aberto, evento, dataInicial])

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    const inicio = diaTodo ? new Date(`${data}T00:00:00`) : new Date(`${data}T${horaInicio}:00`)
    const fim = !diaTodo && horaFim ? new Date(`${data}T${horaFim}:00`) : null
    if (fim && fim <= inicio) {
      toast.error('O horário de término deve ser depois do início.')
      return
    }
    setSalvando(true)
    const { error } = await aoSalvar({
      title: titulo.trim(),
      description: descricao.trim() || null,
      starts_at: inicio.toISOString(),
      ends_at: fim ? fim.toISOString() : null,
      all_day: diaTodo,
      context: contexto,
      reminder_minutes: lembrete === 'nenhum' || diaTodo ? null : Number(lembrete),
    })
    setSalvando(false)
    if (error) {
      toast.error('Não foi possível salvar o compromisso', { description: error })
      return
    }
    toast.success(evento ? 'Compromisso atualizado.' : 'Compromisso criado.')
    aoFechar()
  }

  const excluir = async () => {
    if (!evento || !aoExcluir) return
    const { error } = await aoExcluir(evento.id)
    if (error) {
      toast.error('Não foi possível excluir', { description: error })
      return
    }
    toast.success('Compromisso excluído.')
    aoFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={(open) => !open && aoFechar()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display">
            {evento ? 'Editar compromisso' : 'Novo compromisso'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={salvar} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Reunião com a equipe"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                required
                value={data}
                onChange={(e) => setData(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dia-todo">Dia todo</Label>
              <div className="flex h-10 items-center">
                <Switch id="dia-todo" checked={diaTodo} onCheckedChange={setDiaTodo} />
              </div>
            </div>
          </div>
          {!diaTodo && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="hora-inicio">Início</Label>
                <Input
                  id="hora-inicio"
                  type="time"
                  required
                  value={horaInicio}
                  onChange={(e) => setHoraInicio(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hora-fim">Término (opcional)</Label>
                <Input
                  id="hora-fim"
                  type="time"
                  value={horaFim}
                  onChange={(e) => setHoraFim(e.target.value)}
                />
              </div>
            </div>
          )}
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
            {!diaTodo && (
              <div className="space-y-2">
                <Label>Alerta</Label>
                <Select value={lembrete} onValueChange={setLembrete}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Sem alerta</SelectItem>
                    {LEMBRETES.map((l) => (
                      <SelectItem key={l.value} value={String(l.value)}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição (opcional)</Label>
            <Textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes, local, link…"
              rows={3}
            />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {evento && aoExcluir && (
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
