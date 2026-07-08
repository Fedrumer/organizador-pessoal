import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/auth-context'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function NovaSenha() {
  const navigate = useNavigate()
  const { clearRecoveryMode } = useAuth()
  const [senha, setSenha] = useState('')
  const [confirmacao, setConfirmacao] = useState('')
  const [enviando, setEnviando] = useState(false)

  const salvar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (senha.length < 8) {
      toast.error('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    if (senha !== confirmacao) {
      toast.error('As senhas não conferem.')
      return
    }
    setEnviando(true)
    const { error } = await supabase.auth.updateUser({ password: senha })
    setEnviando(false)
    if (error) {
      toast.error('Não foi possível alterar a senha', { description: error.message })
      return
    }
    clearRecoveryMode()
    toast.success('Senha alterada com sucesso!')
    navigate('/', { replace: true })
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-2xl font-semibold">Criar nova senha</h2>
      <p className="mt-1 text-sm text-muted-foreground">Defina a nova senha da sua conta.</p>
      <form onSubmit={salvar} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="senha">Nova senha</Label>
          <Input
            id="senha"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Mínimo de 8 caracteres"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirmacao">Confirmar nova senha</Label>
          <Input
            id="confirmacao"
            type="password"
            autoComplete="new-password"
            required
            value={confirmacao}
            onChange={(e) => setConfirmacao(e.target.value)}
            placeholder="Repita a senha"
          />
        </div>
        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? 'Salvando…' : 'Salvar nova senha'}
        </Button>
      </form>
    </AuthLayout>
  )
}
