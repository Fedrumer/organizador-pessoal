import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/contexts/auth-context'
import { isSupabaseConfigured } from '@/lib/supabase'
import AppShell from '@/components/layout/AppShell'
import Dashboard from '@/pages/Dashboard'
import Agenda from '@/pages/Agenda'
import Notas from '@/pages/Notas'
import Gastos from '@/pages/Gastos'
import Login from '@/pages/Login'
import Cadastro from '@/pages/Cadastro'
import RecuperarSenha from '@/pages/RecuperarSenha'
import NovaSenha from '@/pages/NovaSenha'
import NotFound from '@/pages/NotFound'

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, recoveryMode } = useAuth()
  if (loading) return null
  if (!session) return <Navigate to="/login" replace />
  if (recoveryMode) return <Navigate to="/nova-senha" replace />
  return <>{children}</>
}

const GuestOnly = ({ children }: { children: React.ReactNode }) => {
  const { session, loading, recoveryMode } = useAuth()
  if (loading) return null
  if (recoveryMode) return <Navigate to="/nova-senha" replace />
  if (session) return <Navigate to="/" replace />
  return <>{children}</>
}

const ConfiguracaoPendente = () => (
  <div className="flex min-h-dvh flex-col items-center justify-center gap-3 px-6 text-center">
    <h1 className="text-xl font-semibold">Configuração pendente</h1>
    <p className="max-w-md text-sm text-muted-foreground">
      As variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code> não foram
      definidas. Configure-as no arquivo <code>.env</code> (ou nos secrets do deploy) e recarregue.
    </p>
  </div>
)

const App = () => {
  if (!isSupabaseConfigured) return <ConfiguracaoPendente />

  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <TooltipProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route
              path="/login"
              element={
                <GuestOnly>
                  <Login />
                </GuestOnly>
              }
            />
            <Route
              path="/cadastro"
              element={
                <GuestOnly>
                  <Cadastro />
                </GuestOnly>
              }
            />
            <Route
              path="/recuperar-senha"
              element={
                <GuestOnly>
                  <RecuperarSenha />
                </GuestOnly>
              }
            />
            <Route path="/nova-senha" element={<NovaSenha />} />
            <Route
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/agenda" element={<Agenda />} />
              <Route path="/notas" element={<Notas />} />
              <Route path="/gastos" element={<Gastos />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
