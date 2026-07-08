import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from '@/components/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function RecuperarSenha() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    setEnviando(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + import.meta.env.BASE_URL,
    })
    setEnviando(false)
    if (error) {
      toast.error('Não foi possível enviar o e-mail', { description: error.message })
      return
    }
    setEnviado(true)
  }

  return (
    <AuthLayout>
      {enviado ? (
        <>
          <h2 className="font-display text-2xl font-semibold">Verifique seu e-mail</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Se existir uma conta para <strong>{email}</strong>, você receberá um link para
            redefinir sua senha.
          </p>
          <Button asChild className="mt-8 w-full">
            <Link to="/login">Voltar para o login</Link>
          </Button>
        </>
      ) : (
        <>
          <h2 className="font-display text-2xl font-semibold">Recuperar senha</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Informe seu e-mail e enviaremos um link para você criar uma nova senha.
          </p>
          <form onSubmit={enviar} className="mt-8 space-y-4">
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
            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? 'Enviando…' : 'Enviar link'}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-medium text-primary hover:underline">
              Voltar para o login
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
