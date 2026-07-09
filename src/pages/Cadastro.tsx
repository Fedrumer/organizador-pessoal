import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function Cadastro() {
  const navigate = useNavigate()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [aguardandoEmail, setAguardandoEmail] = useState(false)

  const cadastrar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (senha.length < 8) {
      toast.error('A senha precisa ter pelo menos 8 caracteres.')
      return
    }
    setEnviando(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { display_name: nome.trim() },
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    })
    setEnviando(false)
    if (error) {
      toast.error('Não foi possível criar a conta', { description: error.message })
      return
    }
    if (data.session) {
      navigate('/', { replace: true })
    } else {
      setAguardandoEmail(true)
    }
  }

  if (aguardandoEmail) {
    return (
      <AuthLayout>
        <h2 className="font-display text-2xl font-semibold">Confirme seu e-mail</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Enviamos um link de confirmação para <strong>{email}</strong>. Abra o e-mail e clique no
          link para ativar sua conta — depois é só entrar.
        </p>
        <Button asChild className="mt-8 w-full">
          <Link to="/login">Ir para o login</Link>
        </Button>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h2 className="font-display text-2xl font-semibold">Criar sua conta</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Leva menos de um minuto — e é gratuito.
      </p>
      <form onSubmit={cadastrar} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="nome">Seu nome</Label>
          <Input
            id="nome"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como devemos te chamar?"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="voce@exemplo.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="senha">Senha</Label>
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
        <Button type="submit" className="w-full" disabled={enviando}>
          {enviando ? 'Criando conta…' : 'Criar conta'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </AuthLayout>
  )
}
