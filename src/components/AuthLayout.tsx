import { Sparkles } from 'lucide-react'

/**
 * Split-screen elegante para as telas de autenticação:
 * painel de marca à esquerda (desktop) e formulário à direita.
 */
export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-[hsl(228,28%,5%)] lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 15%, hsl(42 88% 60% / 0.14), transparent 60%), radial-gradient(ellipse 70% 55% at 85% 90%, hsl(249 48% 44% / 0.22), transparent 65%)',
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12 text-[hsl(40,25%,94%)]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(42,88%,60%)]/15 text-[hsl(42,88%,60%)]">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-lg font-semibold">Meu Organizador</span>
          </div>
          <div className="max-w-md">
            <h1 className="font-display text-4xl font-semibold leading-tight">
              Sua vida pessoal e profissional, organizada em um só lugar.
            </h1>
            <p className="mt-4 text-base text-[hsl(228,10%,62%)]">
              Agenda com alertas, anotações e controle de gastos — tudo sincronizado na nuvem.
            </p>
          </div>
          <p className="text-xs text-[hsl(228,10%,50%)]">
            © {new Date().getFullYear()} Meu Organizador
          </p>
        </div>
      </div>
      <div className="flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm animate-fade-in-up">{children}</div>
      </div>
    </div>
  )
}
