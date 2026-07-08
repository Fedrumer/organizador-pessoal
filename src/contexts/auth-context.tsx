import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { modoLocal, supabase } from '@/lib/supabase'

const USUARIO_LOCAL = {
  id: 'usuario-local',
  aud: 'authenticated',
  role: 'authenticated',
  email: undefined,
  user_metadata: {},
  app_metadata: {},
  created_at: new Date(0).toISOString(),
} as unknown as User

const SESSAO_LOCAL = {
  access_token: 'local',
  token_type: 'bearer',
  expires_in: Number.MAX_SAFE_INTEGER,
  expires_at: Number.MAX_SAFE_INTEGER,
  refresh_token: 'local',
  user: USUARIO_LOCAL,
} as unknown as Session

interface AuthContextValue {
  user: User | null
  session: Session | null
  loading: boolean
  recoveryMode: boolean
  clearRecoveryMode: () => void
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [recoveryMode, setRecoveryMode] = useState(false)

  useEffect(() => {
    if (modoLocal) {
      setSession(SESSAO_LOCAL)
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession)
      setLoading(false)
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    if (modoLocal) return
    await supabase.auth.signOut()
  }, [])

  const clearRecoveryMode = useCallback(() => setRecoveryMode(false), [])

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        loading,
        recoveryMode,
        clearRecoveryMode,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}

export function nomeExibicao(user: User | null): string {
  if (!user || user.id === 'usuario-local') return ''
  const nome = (user.user_metadata?.display_name as string | undefined)?.trim()
  if (nome) return nome.split(' ')[0]
  return user.email?.split('@')[0] ?? ''
}
