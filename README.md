# SIGES-PIN — Front-end

Front-end do Sistema Corporativo de Gestão do Portfólio de Inovação da BBTS.
React 18 + Vite + TypeScript + Tailwind CSS 3.4.

## Como rodar

```bash
npm ci
npm run dev        # http://localhost:3000
npm run typecheck
npm run build      # checagem de tipos + build de produção
```

Por padrão o app roda em **modo demonstração** (`VITE_USE_MOCK=true` no `.env`), com um banco em memória que
aplica as regras da revisão 2 (docs/RELATORIO_MUDANCAS.md). Na tela de login há atalhos para os três perfis e para usuários com alçada de governança
(senha dos usuários de teste em `src/services/mock/seed.ts`). Em "Meu perfil" é possível restaurar os dados.

O frontend também é um PWA: em produção, abra o sistema por HTTPS (ou localhost), aguarde o carregamento inicial e use **Instalar aplicativo** quando o navegador oferecer a instalação. O app shell e os recursos estáticos já visitados ficam disponíveis offline; chamadas à API não são armazenadas e precisam de conexão.

Para apontar ao back-end Spring Boot (`http://localhost:8080`, via proxy `/api`), defina `VITE_USE_MOCK=false` e `VITE_API_BASE_URL=/api`. As rotas em `src/services/index.ts` são propostas pela revisão 2 e ainda precisam ser confirmadas com o backend; essa configuração, por si só, não comprova integração funcional.

## Telas

| Rota | Tela | Quem usa |
|---|---|---|
| `/` · `/login` · `/cadastro` | Landing, login e solicitação de acesso | Público |
| `/app` | Dashboard | Todos |
| `/app/portfolio` | Portfólio (lista ⇄ Kanban da jornada) | Todos |
| `/app/campanhas` | Campanhas, desafios, hackathons e residências | Todos (Analista abre e encerra) |
| `/app/demandas/nova` | Nova demanda (espontânea ou induzida) com IA | Demandante |
| `/app/minhas-demandas` | Minhas demandas e validação de entregas | Demandante |
| `/app/triagem` | Triagem e qualificação | Analista |
| `/app/pareceres` | Pareceres técnicos | Especialista |
| `/app/governanca` | Pauta de priorização e decisão | Quem tem alçada de governança |
| `/app/projetos/:id` | Detalhes do projeto (ações por perfil e etapa) | Todos |
| `/app/perfil` | Meu perfil | Todos |

## Estrutura

```
src/
├── assets/          # URLs das fotos (Unsplash)
├── components/      # common (ui), layout (menu lateral direito), projeto (modais), radar, trl
├── contexts/        # AuthContext (sessão, perfil, podeVerFinanceiro)
├── hooks/           # useAuth, useAsync, useDebounce, useReveal
├── pages/           # public/ e app/
├── services/        # api.ts (axios), index.ts (serviços), mock/ (banco em memória)
├── types/           # entidades e DTOs do domínio
└── utils/           # rótulos, cores, TRL e formatadores
```

Documentação: [docs/RELATORIO_MUDANCAS.md](docs/RELATORIO_MUDANCAS.md) (revisão 2, vigente) e [docs/PROPOSTA_FRONTEND.md](docs/PROPOSTA_FRONTEND.md) (proposta inicial).
Auditoria e validação desta organização: [docs/AUDITORIA_FRONTEND.md](docs/AUDITORIA_FRONTEND.md).

## Organização e atualização da documentação

O frontend de trabalho fica nesta pasta `sigespin/`. A auditoria registra o que foi reorganizado, as validações executadas, o estado do Git e as dependências ainda não confirmadas. A revisão de domínio continua sendo a revisão 2 de `docs/RELATORIO_MUDANCAS.md`; a auditoria não altera nem substitui as regras de negócio nela descritas.
