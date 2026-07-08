# ✨ Meu Organizador

Organizador **pessoal e profissional** com visual escuro e elegante:

- 📅 **Agenda** — calendário mensal com compromissos e alertas (notificação no navegador + aviso no app)
- 📝 **Notas** — anotações rápidas com busca, fixação e filtro pessoal/profissional
- 💰 **Gastos** — controle de despesas por categoria, com gráficos e evolução mensal
- 🔔 **Alertas** — lembretes configuráveis (5 min a 1 dia antes) e sino com as próximas 24h
- 🌙 **Tema** — escuro sofisticado por padrão, com modo claro opcional

Funciona em dois modos, automaticamente:

- **Modo local (padrão)** — sem configurar nada, os dados ficam salvos no próprio navegador do dispositivo.
- **Modo nuvem** — configurando o [Supabase](https://supabase.com) (variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`), o app passa a ter login por e-mail/senha e sincronização entre dispositivos, com cada pessoa enxergando só os próprios dados (RLS).

## Stack

React 19 · Vite · TypeScript · Tailwind CSS · shadcn/ui · Supabase (auth + Postgres) · Recharts · date-fns

## Como rodar localmente

1. Crie um projeto gratuito no [Supabase](https://supabase.com) e rode o SQL de `supabase/migrations/0001_schema_inicial.sql` no **SQL Editor**.
2. Copie `.env.example` para `.env` e preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` (Painel → Settings → API).
3. Instale e rode:

```bash
npm install
npm run dev
```

Abra [http://localhost:8080](http://localhost:8080), crie sua conta e pronto.

## Deploy (GitHub Pages)

O workflow `.github/workflows/deploy.yml` publica o app no GitHub Pages a cada push na `main`.

Configuração única no repositório:

1. **Settings → Pages** → Source: **GitHub Actions**
2. **Settings → Secrets and variables → Actions → Variables** → crie:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

> A anon key é pública por design — a segurança vem das políticas RLS do banco.
